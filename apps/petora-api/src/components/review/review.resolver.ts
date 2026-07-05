import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ReviewInput, ReviewsInquiry } from '../../libs/dto/review/review.input';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Review, Reviews } from '../../libs/dto/review/review';
import { ReviewService } from './review.service';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

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

	@UseGuards(WithoutGuard)
	@Query((returns) => Reviews)
	public async getReviews(@Args('input') input: ReviewsInquiry): Promise<Reviews> {
		console.log('Query: getReviews');
		input.search.reviewRefId = shapeIntoMongoObjectId(input.search.reviewRefId);
		return await this.reviewService.getReviews(input);
	}
}
