import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class QnaInput {
	@IsNotEmpty()
	@Field(() => String)
	questionTitle: string;

	@IsNotEmpty()
	@Field(() => String)
	questionContent: string;

	@IsOptional()
	@IsArray()
	@Field(() => [String], { nullable: true })
	questionImages?: string[];

	memberId: Types.ObjectId;
}
