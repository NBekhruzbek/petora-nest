import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ReviewInput } from '../../libs/dto/review/review.input';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Review } from '../../libs/dto/review/review';
import { ReviewService } from './review.service';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';

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
}
