import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ReviewGroup, ReviewStatus } from '../../libs/enums/review.enum';
import { ReviewInput, ReviewsInquiry } from '../../libs/dto/review/review.input';
import { ReviewUpdate } from '../../libs/dto/review/review.update';
import { ServiceService } from '../service/service.service';
import { ProductService } from '../product/product.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { MemberService } from '../member/member.service';
import { Direction, Message } from '../../libs/enums/common.enum';
import { Review, ReviewStats, Reviews } from '../../libs/dto/review/review';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ReviewService {
	constructor(
		@InjectModel('Review') private readonly reviewModel: Model<Review>,
		private readonly memberService: MemberService,
		private readonly serviceService: ServiceService,
		private readonly productService: ProductService,
	) {}

	/** MUTATIONS **/

	public async createNewReview(memberId: Types.ObjectId, input: ReviewInput): Promise<Review> {
		input.memberId = memberId;
		input.reviewRefId = shapeIntoMongoObjectId(input.reviewRefId);

		const existing = await this.reviewModel
			.findOne({ memberId, reviewRefId: input.reviewRefId, reviewGroup: input.reviewGroup })
			.exec();
		if (existing) throw new BadRequestException(Message.ALREADY_REVIEWED);

		let result: Review;
		try {
			result = await this.reviewModel.create(input);
		} catch (err) {
			console.log('Error, Review.model:', err instanceof Error ? err.message : err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		const reviewRefId = result.reviewRefId;
		const newRating = await this.computeAverageRating(result.reviewGroup, reviewRefId, result.reviewRating);
		await this.syncTargetStats(result.reviewGroup, reviewRefId, newRating);

		return result;
	}

	public async updateReview(memberId: Types.ObjectId, input: ReviewUpdate): Promise<Review> {
		const { reviewId, reviewRating } = input;

		const result = await this.reviewModel.findOneAndUpdate(
			{ _id: reviewId, memberId: memberId, reviewStatus: ReviewStatus.ACTIVE },
			input,
			{ new: true },
		);
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (reviewRating !== undefined) {
			const newRating = await this.computeAverageRating(result.reviewGroup, result.reviewRefId, result.reviewRating);
			await this.syncTargetRating(result.reviewGroup, result.reviewRefId, newRating);
		}

		return result;
	}

	/** QUERIES **/

	public async getReviews(input: ReviewsInquiry): Promise<Reviews> {
		const { reviewGroup, reviewRefId } = input.search;
		const match: T = { reviewGroup, reviewRefId, reviewStatus: ReviewStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.reviewModel.aggregate([
			{ $match: match },
			{ $sort: sort },
			{
				$facet: {
					list: [
						{ $skip: (input.page - 1) * input.limit },
						{ $limit: input.limit },
						lookupMember,
						{ $unwind: '$memberData' },
					],
					metaCounter: [{ $count: 'total' }],
					distribution: [{ $group: { _id: '$reviewRating', count: { $sum: 1 } } }],
				},
			},
		]);
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const { list, metaCounter, distribution } = result[0];
		const totalReviews = metaCounter[0]?.total ?? 0;

		return { list, metaCounter, stats: this.buildReviewStats(distribution, totalReviews) };
	}

	/** HELPERS */

	private getStatsTarget(reviewGroup: ReviewGroup) {
		return {
			[ReviewGroup.AGENT]: {
				reviewsKey: 'memberReviews',
				ratingKey: 'memberRating',
				statsEditor: (input: StatisticModifier) => this.memberService.memberStatsEditor(input),
				getTarget: (targetId: Types.ObjectId) => this.memberService.getMember(null, targetId),
			},
			[ReviewGroup.SERVICE]: {
				reviewsKey: 'serviceReviews',
				ratingKey: 'serviceRating',
				statsEditor: (input: StatisticModifier) => this.serviceService.serviceStatsEditor(input),
				getTarget: (targetId: Types.ObjectId) => this.serviceService.getService(null, targetId),
			},
			[ReviewGroup.PRODUCT]: {
				reviewsKey: 'productReviews',
				ratingKey: 'productRating',
				statsEditor: (input: StatisticModifier) => this.productService.productStatsEditor(input),
				getTarget: (targetId: Types.ObjectId) => this.productService.getProduct(null, targetId),
			},
		}[reviewGroup];
	}

	private async syncTargetStats(
		reviewGroup: ReviewGroup,
		reviewRefId: Types.ObjectId,
		newRating: number,
	): Promise<void> {
		const { reviewsKey, statsEditor } = this.getStatsTarget(reviewGroup);
		await statsEditor({ _id: reviewRefId, targetKey: reviewsKey, modifier: 1 });
		await this.syncTargetRating(reviewGroup, reviewRefId, newRating);
	}

	private async syncTargetRating(
		reviewGroup: ReviewGroup,
		reviewRefId: Types.ObjectId,
		newRating: number,
	): Promise<void> {
		const { ratingKey, statsEditor, getTarget } = this.getStatsTarget(reviewGroup);

		const target = await getTarget(reviewRefId);
		await statsEditor({ _id: reviewRefId, targetKey: ratingKey, modifier: newRating - target[ratingKey] });
	}

	private async computeAverageRating(
		reviewGroup: ReviewGroup,
		reviewRefId: Types.ObjectId,
		fallbackRating: number,
	): Promise<number> {
		const [avg] = await this.reviewModel.aggregate([
			{ $match: { reviewGroup, reviewRefId, reviewStatus: ReviewStatus.ACTIVE } },
			{ $group: { _id: null, avgRating: { $avg: '$reviewRating' } } },
		]);
		return avg ? Math.round(avg.avgRating * 10) / 10 : fallbackRating;
	}

	private buildReviewStats(distribution: { _id: number; count: number }[], totalReviews: number): ReviewStats {
		const countsByStar = new Map(distribution.map((entry) => [entry._id, entry.count]));
		const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
			const count = countsByStar.get(star) ?? 0;
			return { star, count, percentage: totalReviews ? Math.round((count / totalReviews) * 100) : 0 };
		});

		const ratingSum = distribution.reduce((sum, entry) => sum + entry._id * entry.count, 0);
		const averageRating = totalReviews ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0;

		return { totalReviews, averageRating, ratingDistribution };
	}
}
