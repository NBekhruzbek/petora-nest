import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ReviewGroup, ReviewStatus } from '../../libs/enums/review.enum';
import { ReviewInput } from '../../libs/dto/review/review.input';
import { ServiceService } from '../service/service.service';
import { ProductService } from '../product/product.service';
import { StatisticModifier } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { MemberService } from '../member/member.service';
import { Message } from '../../libs/enums/common.enum';
import { Review } from '../../libs/dto/review/review';
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
		const { reviewsKey, ratingKey, statsEditor, getTarget } = this.getStatsTarget(reviewGroup);

		await statsEditor({ _id: reviewRefId, targetKey: reviewsKey, modifier: 1 });

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
}
