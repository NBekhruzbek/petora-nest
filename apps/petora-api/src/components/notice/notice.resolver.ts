import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NoticeService } from './notice.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Types } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { NoticeDetail } from '../../libs/dto/notice/notice';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { NoticeUpdateInput } from '../../libs/dto/notice/notice.update';

@Resolver()
export class NoticeResolver {
	constructor(private readonly noticeService: NoticeService) {}

	/** ADMIN */

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => NoticeDetail)
	public async createNewNotice(
		@Args('input') input: NoticeInput,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<NoticeDetail> {
		console.log('Mutation: createNewNotice');
		return this.noticeService.createNewNotice(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => NoticeDetail)
	public async getNoticeDetailByAdmin(
		@Args('noticeId') input: string,
		@AuthMember('_id') memberId: Types.ObjectId | null,
	): Promise<NoticeDetail> {
		console.log('Query: getNoticeDetailByAdmin');
		const noticeId = shapeIntoMongoObjectId(input);
		return await this.noticeService.getNoticeDetailByAdmin(noticeId);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => NoticeDetail)
	public async updateNoticeByAdmin(
		@Args('input') input: NoticeUpdateInput,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<NoticeDetail> {
		console.log('Mutation: updateNoticeByAdmin');
		return this.noticeService.updateNoticeByAdmin(memberId, input);
	}
}
