import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { NoticeService } from './notice.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Types } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { NoticeDetail } from '../../libs/dto/notice/notice';

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
}
