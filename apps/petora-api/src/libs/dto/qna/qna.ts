import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Member } from '../member/member';
import { Types } from 'mongoose';
import { QnaStatus } from '../../enums/qna.enum';

@ObjectType()
export class QnaQuestion {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => String)
	qnaStatus: QnaStatus;

	@Field(() => String)
	questionTitle: string;

	@Field(() => String)
	questionContent: string;

	@Field(() => [String], { nullable: true })
	questionImages?: string[];

	@Field(() => Int)
	questionLikes: number;

	@Field(() => Int)
	questionViews: number;

	@Field(() => Int)
	questionAnswers: number;

	@Field(() => String)
	memberId: Types.ObjectId;

	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
