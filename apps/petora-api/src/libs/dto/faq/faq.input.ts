import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { FaqStatus, FaqType } from '../../enums/faq.enum';
import { Types } from 'mongoose';
import { availableFaqSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

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

@InputType()
class FaqISearch {
	@IsOptional()
	@Field(() => FaqType, { nullable: true })
	faqType?: FaqType;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class FaqsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableFaqSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => FaqISearch)
	search: FaqISearch;
}
