import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FaqInput } from '../../libs/dto/faq/faq.input';
import { FaqDetail } from '../../libs/dto/faq/faq';
import { Message } from '../../libs/enums/common.enum';
import { Model, Types } from 'mongoose';

@Injectable()
export class FaqService {
	constructor(@InjectModel('FAQ') private readonly faqModel: Model<FaqDetail>) {}

	public async createNewFaq(memberId: Types.ObjectId, input: FaqInput): Promise<FaqDetail> {
		input.memberId = memberId;

		const result: FaqDetail = await this.faqModel.create(input);
		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		return result;
	}
}
