import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FaqService } from './faq.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { FaqInput, FaqsInquiry } from '../../libs/dto/faq/faq.input';
import { FaqDetail, Faqs } from '../../libs/dto/faq/faq';
import { Types } from 'mongoose';
import { FaqUpdateInput } from '../../libs/dto/faq/faq.update';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class FaqResolver {
	constructor(private readonly faqService: FaqService) {}

	/** ADMIN */

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => FaqDetail)
	public async createNewFaq(
		@Args('input') input: FaqInput,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<FaqDetail> {
		console.log('Mutation: createNewFaq');
		return this.faqService.createNewFaq(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => FaqDetail)
	public async updateFaq(
		@Args('input') input: FaqUpdateInput,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<FaqDetail> {
		console.log('Mutation: updateFaq');
		return this.faqService.updateFaq(memberId, input);
	}

	/** MEMBER **/

	@UseGuards(WithoutGuard)
	@Query((returns) => Faqs)
	public async getFaqs(
		@Args('input') input: FaqsInquiry,
		@AuthMember('_id') memberId: Types.ObjectId | null,
	): Promise<Faqs> {
		console.log('Query: getFaqs');
		return await this.faqService.getFaqs(input);
	}
}
