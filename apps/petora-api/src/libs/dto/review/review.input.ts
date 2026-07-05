import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ReviewGroup } from '../../enums/review.enum';
import { Field, InputType } from '@nestjs/graphql';
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
