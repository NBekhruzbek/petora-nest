import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FaqInput } from '../../libs/dto/faq/faq.input';
import { FaqDetail } from '../../libs/dto/faq/faq';
import { Message } from '../../libs/enums/common.enum';
import { Model, Types } from 'mongoose';
import { FaqUpdateInput } from '../../libs/dto/faq/faq.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { FaqStatus } from '../../libs/enums/faq.enum';

@Injectable()
export class FaqService {
	constructor(@InjectModel('FAQ') private readonly faqModel: Model<FaqDetail>) {}

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
}
