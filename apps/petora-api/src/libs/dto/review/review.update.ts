import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ReviewStatus } from '../../enums/review.enum';
import { Types } from 'mongoose';

@InputType()
export class ReviewUpdate {
	@IsNotEmpty()
	@Field(() => String)
	reviewId: Types.ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	reviewMessage?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	reviewImages?: string[];

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(5)
	@Field(() => Number, { nullable: true })
	reviewRating?: number;
}
