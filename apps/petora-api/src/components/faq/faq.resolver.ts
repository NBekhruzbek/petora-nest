import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FaqService } from './faq.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { FaqInput } from '../../libs/dto/faq/faq.input';
import { FaqDetail } from '../../libs/dto/faq/faq';
import { Types } from 'mongoose';
import { FaqUpdateInput } from '../../libs/dto/faq/faq.update';

@Resolver()
export class FaqResolver {
	constructor(private readonly faqService: FaqService) {}

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
}
