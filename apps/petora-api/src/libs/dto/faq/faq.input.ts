import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { FaqStatus, FaqType } from '../../enums/faq.enum';
import { Types } from 'mongoose';

@InputType()
export class FaqInput {
	@IsNotEmpty()
	@Field(() => FaqType)
	faqType: FaqType;

	@IsNotEmpty()
	@Field(() => FaqStatus)
	faqStatus: FaqStatus;

	@IsNotEmpty()
	@Field(() => String)
	faqTitle: string;

	@IsNotEmpty()
	@Field(() => String)
	faqContent: string;

	memberId: Types.ObjectId;
}
