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
import { shapeIntoMongoObjectId } from '../../libs/config';

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
	@Query((returns) => FaqDetail)
	public async getFaqDetailByAdmin(
		@Args('faqId') input: string,
		@AuthMember('_id') memberId: Types.ObjectId | null,
	): Promise<FaqDetail> {
		console.log('Query: getFaqDetailByAdmin');
		const faqId = shapeIntoMongoObjectId(input);
		return await this.faqService.getFaqDetailByAdmin(faqId);
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

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => FaqDetail)
	public async removeFaqByAdmin(
		@Args('faqId') input: string,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<FaqDetail> {
		console.log('Mutation: removeFaqByAdmin');
		const faqId = shapeIntoMongoObjectId(input);
		return await this.faqService.removeFaqByAdmin(faqId);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Faqs)
	public async getAllFaqsByAdmin(
		@Args('input') input: FaqsInquiry,
		@AuthMember('_id') memberId: Types.ObjectId | null,
	): Promise<Faqs> {
		console.log('Query: getAllFaqsByAdmin');
		return await this.faqService.getAllFaqsByAdmin(input);
	}

	/** MEMBER **/

	@UseGuards(WithoutGuard)
	@Query((returns) => FaqDetail)
	public async getFaqDetail(
		@Args('faqId') input: string,
		@AuthMember('_id') memberId: Types.ObjectId | null,
	): Promise<FaqDetail> {
		console.log('Query: getFaqDetail');
		const faqId = shapeIntoMongoObjectId(input);
		return await this.faqService.getFaqDetail(memberId, faqId);
	}

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
