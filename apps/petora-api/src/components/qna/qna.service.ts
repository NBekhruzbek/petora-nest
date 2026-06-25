import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ViewService } from '../view/view.service';
import { QnaInput } from '../../libs/dto/qna/qna.input';
import { QnaQuestion } from '../../libs/dto/qna/qna';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';

@Injectable()
export class QnaService {
	constructor(
		@InjectModel('QNA') private readonly qnaModel: Model<QnaQuestion>,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
	) {}

	public async createNewQuestion(memberId: Types.ObjectId, input: QnaInput): Promise<QnaQuestion> {
		input.memberId = memberId;

		const result: QnaQuestion = await this.qnaModel.create(input);
		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		await this.memberService.memberStatsEditor({
			_id: result.memberId,
			targetKey: 'memberQuestions',
			modifier: 1,
		});

		return result;
	}
}
