import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { FaqStatus, FaqType } from '../../enums/faq.enum';
import { Types } from 'mongoose';

@InputType()
export class FaqUpdateInput {
	@IsNotEmpty()
	@Field(() => String)
	faqId: Types.ObjectId;

	@IsOptional()
	@Field(() => FaqType, { nullable: true })
	faqType?: FaqType;

	@IsOptional()
	@Field(() => FaqStatus, { nullable: true })
	faqStatus?: FaqStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	faqTitle?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	faqContent?: string;

	memberId: Types.ObjectId;
}
