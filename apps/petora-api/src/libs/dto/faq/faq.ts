import { Field, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { FaqStatus, FaqType } from '../../enums/faq.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class FaqDetail {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => FaqType)
	faqType: FaqType;

	@Field(() => FaqStatus)
	faqStatus: FaqStatus;

	@Field(() => String)
	faqTitle: string;

	@Field(() => String)
	faqContent: string;

	@Field(() => String)
	memberId: Types.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class Faqs {
	@Field(() => [FaqDetail])
	list: FaqDetail[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
