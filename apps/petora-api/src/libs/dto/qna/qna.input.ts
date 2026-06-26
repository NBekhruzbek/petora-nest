import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Types } from 'mongoose';
import { Direction } from '../../enums/common.enum';
import { availableQnaSorts } from '../../config';
import { QnaStatus } from '../../enums/qna.enum';

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

@InputType()
class QnaISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: Types.ObjectId;
}

@InputType()
export class QnaQuestionInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableQnaSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => QnaISearch)
	search: QnaISearch;
}

@InputType()
class AQnaISearch {
	@IsOptional()
	@Field(() => QnaStatus, { nullable: true })
	qnaStatus?: QnaStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: Types.ObjectId;
}

@InputType()
export class AllQnaQuestionsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableQnaSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => AQnaISearch)
	search: AQnaISearch;
}
