import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/view.service';
import { Model, Types } from 'mongoose';
import { Message } from '../../libs/enums/common.enum';
import { NoticeDetail } from '../../libs/dto/notice/notice';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { T } from '../../libs/types/common';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { NoticeUpdateInput } from '../../libs/dto/notice/notice.update';

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

	public async updateNoticeByAdmin(memberId: Types.ObjectId, input: NoticeUpdateInput): Promise<NoticeDetail> {
		input.memberId = memberId;
		input.noticeId = shapeIntoMongoObjectId(input.noticeId);

		const { noticeId, ...updateData } = input;

		const search = {
			_id: noticeId,
			noticeStatus: { $in: [NoticeStatus.ACTIVE, NoticeStatus.HIDE] },
		};

		const result: NoticeDetail = await this.noticeModel
			.findOneAndUpdate(search, { $set: updateData }, { new: true })
			.exec();
		if (!result) throw new BadRequestException(Message.UPDATE_FAILED);

		return result;
	}

	public async removeNoticeByAdmin(noticeId: Types.ObjectId): Promise<NoticeDetail> {
		const search: T = { _id: noticeId, noticeStatus: NoticeStatus.DELETE };
		const result = await this.noticeModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	/** QUEIRES **/

	public async getNoticeDetailByAdmin(noticeId: Types.ObjectId): Promise<NoticeDetail> {
		const search: T = {
			_id: noticeId,
			noticeStatus: { $in: [NoticeStatus.ACTIVE, NoticeStatus.HIDE] },
		};

		const result: NoticeDetail = await this.noticeModel.findOne(search).lean().exec();
		if (!result) throw new BadRequestException(Message.NO_DATA_FOUND);

		return result;
	}
}
