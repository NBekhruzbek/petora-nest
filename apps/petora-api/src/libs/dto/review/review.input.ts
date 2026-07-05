import { IsIn, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ReviewGroup } from '../../enums/review.enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Direction } from '../../enums/common.enum';
import { availableReviewSorts } from '../../config';
import { Types } from 'mongoose';

@InputType()
export class ReviewInput {
	@IsNotEmpty()
	@Field(() => String)
	reviewRefId: string;

	@IsNotEmpty()
	@Field(() => ReviewGroup)
	reviewGroup: ReviewGroup;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	reviewImages?: string[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	reviewMessage?: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	@Max(5)
	@Field(() => Number)
	reviewRating: number;

	memberId?: Types.ObjectId;
}

@InputType()
class RISearch {
	@IsNotEmpty()
	@Field(() => ReviewGroup)
	reviewGroup: ReviewGroup;

	@IsNotEmpty()
	@Field(() => String)
	reviewRefId: string;
}

@InputType()
export class ReviewsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableReviewSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => RISearch)
	search: RISearch;
}
