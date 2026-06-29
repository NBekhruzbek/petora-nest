import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/view.service';
import { Model, Types } from 'mongoose';
import { Message } from '../../libs/enums/common.enum';
import { NoticeDetail } from '../../libs/dto/notice/notice';
import { NoticeInput } from '../../libs/dto/notice/notice.input';

@Injectable()
export class NoticeService {
	constructor(
		@InjectModel('Notice') private readonly noticeModel: Model<NoticeDetail>,
		private readonly viewService: ViewService,
	) {}

	/** MUTATIONS **/
	public async createNewNotice(memberId: Types.ObjectId, input: NoticeInput): Promise<NoticeDetail> {
		input.memberId = memberId;

		const result: NoticeDetail = await this.noticeModel.create(input);
		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		return result;
	}
}
