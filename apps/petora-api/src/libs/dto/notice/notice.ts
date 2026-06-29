import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { NoticeStatus, NoticeType } from '../../enums/notice.enum';

@ObjectType()
export class NoticeDetail {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => NoticeType)
	noticeType: NoticeType;

	@Field(() => NoticeStatus)
	noticeStatus: NoticeStatus;

	@Field(() => String)
	noticeTitle: string;

	@Field(() => String)
	noticeSummary: string;

	@Field(() => String)
	noticeContent: string;

	@Field(() => Int)
	noticeViews: number;

	@Field(() => String)
	memberId: Types.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
