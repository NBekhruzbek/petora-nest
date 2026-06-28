import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FaqInput, FaqsInquiry } from '../../libs/dto/faq/faq.input';
import { FaqDetail, Faqs } from '../../libs/dto/faq/faq';
import { Direction, Message } from '../../libs/enums/common.enum';
import { Model, Types } from 'mongoose';
import { FaqUpdateInput } from '../../libs/dto/faq/faq.update';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { FaqStatus } from '../../libs/enums/faq.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class FaqService {
	constructor(@InjectModel('FAQ') private readonly faqModel: Model<FaqDetail>) {}

	/** MUTATIONS **/
	public async createNewFaq(memberId: Types.ObjectId, input: FaqInput): Promise<FaqDetail> {
		input.memberId = memberId;

		const result: FaqDetail = await this.faqModel.create(input);
		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		return result;
	}

	public async updateFaq(memberId: Types.ObjectId, input: FaqUpdateInput): Promise<FaqDetail> {
		input.memberId = memberId;
		input.faqId = shapeIntoMongoObjectId(input.faqId);

		const { faqId, ...updateData } = input;

		const search = {
			_id: faqId,
			faqStatus: { $in: [FaqStatus.ACTIVE, FaqStatus.HIDE] },
		};

		const result: FaqDetail = await this.faqModel.findOneAndUpdate(search, { $set: updateData }, { new: true }).exec();
		if (!result) throw new BadRequestException(Message.UPDATE_FAILED);

		return result;
	}

	/** QUERIES **/

	public async getAllFaqsByAdmin(input: FaqsInquiry): Promise<Faqs> {
		const { text } = input.search;
		const match: T = { faqStatus: { $in: [FaqStatus.ACTIVE, FaqStatus.HIDE] } };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (text)
			match.$or = [{ faqTitle: { $regex: new RegExp(text, 'i') } }, { faqContent: { $regex: new RegExp(text, 'i') } }];

		const result = await this.faqModel
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

	public async getFaqs(input: FaqsInquiry): Promise<Faqs> {
		const { text } = input.search;
		const match: T = { faqStatus: FaqStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (text)
			match.$or = [{ faqTitle: { $regex: new RegExp(text, 'i') } }, { faqContent: { $regex: new RegExp(text, 'i') } }];

		const result = await this.faqModel
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
}
