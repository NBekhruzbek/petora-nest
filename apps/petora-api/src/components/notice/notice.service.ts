import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/view.service';
import { Model, Types } from 'mongoose';
import { Direction, Message } from '../../libs/enums/common.enum';
import { NoticeDetail, Notices } from '../../libs/dto/notice/notice';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { StatisticModifier, T } from '../../libs/types/common';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { NoticeUpdateInput } from '../../libs/dto/notice/notice.update';
import { ViewGroup } from '../../libs/enums/view.enum';

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

	public async getNoticeDetail(memberId: Types.ObjectId, noticeId: Types.ObjectId): Promise<NoticeDetail> {
		const search: T = {
			_id: noticeId,
			noticeStatus: NoticeStatus.ACTIVE,
		};

		const result: NoticeDetail = await this.noticeModel.findOne(search).lean().exec();
		if (!result) throw new BadRequestException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: noticeId, viewGroup: ViewGroup.NOTICE };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.noticeStatsEditor({ _id: noticeId, targetKey: 'noticeViews', modifier: 1 });
				result.noticeViews++;
			}
		}

		return result;
	}

	public async getNotices(input: NoticeInquiry): Promise<Notices> {
		const { text } = input.search;
		const match: T = { noticeStatus: NoticeStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (text)
			match.$or = [
				{ noticeTitle: { $regex: new RegExp(text, 'i') } },
				{ noticeSummary: { $regex: new RegExp(text, 'i') } },
				{ noticeContent: { $regex: new RegExp(text, 'i') } },
			];

		const result = await this.noticeModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async getAllNoticesByAdmin(input: NoticeInquiry): Promise<Notices> {
		const { text } = input.search;
		const match: T = { noticeStatus: { $in: [NoticeStatus.ACTIVE, NoticeStatus.HIDE] } };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (text)
			match.$or = [
				{ noticeTitle: { $regex: new RegExp(text, 'i') } },
				{ noticeSummary: { $regex: new RegExp(text, 'i') } },
				{ noticeContent: { $regex: new RegExp(text, 'i') } },
			];

		const result = await this.noticeModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	/** HELPERS **/

	public async noticeStatsEditor(input: StatisticModifier): Promise<NoticeDetail> {
		const { _id, targetKey, modifier } = input;
		return await this.noticeModel
			.findByIdAndUpdate(
				_id,
				{
					$inc: { [targetKey]: modifier },
				},
				{
					new: true,
				},
			)
			.exec();
	}
}
