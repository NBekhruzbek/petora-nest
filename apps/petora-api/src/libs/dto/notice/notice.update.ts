import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { NoticeStatus, NoticeType } from '../../enums/notice.enum';
import { Types } from 'mongoose';

@InputType()
export class NoticeUpdateInput {
	@IsNotEmpty()
	@Field(() => String)
	noticeId: Types.ObjectId;

	@IsOptional()
	@Field(() => NoticeType, { nullable: true })
	noticeType?: NoticeType;

	@IsOptional()
	@Field(() => NoticeStatus, { nullable: true })
	noticeStatus?: NoticeStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	noticeTitle?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	noticeSummary?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	noticeContent?: string;

	memberId: Types.ObjectId;
}
