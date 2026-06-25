import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { QnaStatus } from '../../enums/qna.enum';
import { Types } from 'mongoose';

@InputType()
export class QuestionUpdateInput {
	@IsNotEmpty()
	@Field(() => String)
	questionId: Types.ObjectId;

	@IsOptional()
	@Field(() => QnaStatus, { nullable: true })
	qnaStatus?: QnaStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	questionTitle?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	questionContent?: string;

	@IsOptional()
	@IsArray()
	@Field(() => [String], { nullable: true })
	questionImages?: string[];

	memberId: Types.ObjectId;
}
