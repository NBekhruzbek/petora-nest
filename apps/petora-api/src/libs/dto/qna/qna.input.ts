import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
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
	@Field(() => [String], { nullable: true })
	questionImages?: string[];

	memberId: Types.ObjectId;
}
