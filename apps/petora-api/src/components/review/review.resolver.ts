import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ReviewInput, ReviewsInquiry } from '../../libs/dto/review/review.input';
import { AdminReviewUpdate, ReviewUpdate } from '../../libs/dto/review/review.update';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Review, Reviews } from '../../libs/dto/review/review';
import { ReviewService } from './review.service';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class ReviewResolver {
	constructor(private readonly reviewService: ReviewService) {}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Review)
	public async createNewReview(
		@Args('input') input: ReviewInput,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<Review> {
		console.log('Mutation: createNewReview');
		return await this.reviewService.createNewReview(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Review)
	public async updateReview(
		@Args('input') input: ReviewUpdate,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<Review> {
		console.log('Mutation: updateReview');
		input.reviewId = shapeIntoMongoObjectId(input.reviewId);
		return await this.reviewService.updateReview(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Reviews)
	public async getReviews(@Args('input') input: ReviewsInquiry): Promise<Reviews> {
		console.log('Query: getReviews');
		input.search.reviewRefId = shapeIntoMongoObjectId(input.search.reviewRefId);
		return await this.reviewService.getReviews(input);
	}

	/** ADMIN */

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Review)
	public async updateReviewByAdmin(@Args('input') input: AdminReviewUpdate): Promise<Review> {
		console.log('Mutation: updateReviewByAdmin');
		input.reviewId = shapeIntoMongoObjectId(input.reviewId);
		return await this.reviewService.updateReviewByAdmin(input);
	}
}
