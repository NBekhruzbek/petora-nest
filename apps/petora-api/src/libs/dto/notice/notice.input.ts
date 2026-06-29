import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { NoticeStatus, NoticeType } from '../../enums/notice.enum';
import { Types } from 'mongoose';

@InputType()
export class NoticeInput {
	@IsNotEmpty()
	@Field(() => NoticeType)
	noticeType: NoticeType;

	@IsNotEmpty()
	@Field(() => NoticeStatus)
	noticeStatus: NoticeStatus;

	@IsNotEmpty()
	@Field(() => String)
	noticeTitle: string;

	@IsNotEmpty()
	@Field(() => String)
	noticeSummary: string;

	@IsNotEmpty()
	@Field(() => String)
	noticeContent: string;

	memberId: Types.ObjectId;
}
