import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ViewService } from '../view/view.service';
import { QnaInput } from '../../libs/dto/qna/qna.input';
import { QnaQuestion } from '../../libs/dto/qna/qna';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { QnaStatus } from '../../libs/enums/qna.enum';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class QnaService {
	constructor(
		@InjectModel('QNA') private readonly qnaModel: Model<QnaQuestion>,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
	) {}

	/** MUTATIONS **/

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

	/** QUERIES**/

	public async getQuestion(memberId: Types.ObjectId, questionId: Types.ObjectId): Promise<QnaQuestion> {
		const search: T = {
			_id: questionId,
			qnaStatus: QnaStatus.ACTIVE,
		};

		const targetQuestion: QnaQuestion = await this.qnaModel.findOne(search).lean().exec();
		if (!targetQuestion) throw new BadRequestException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: questionId, viewGroup: ViewGroup.QNA };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.questionStatsEditor({ _id: questionId, targetKey: 'questionViews', modifier: 1 });
				targetQuestion.questionViews++;
			}

			// TODO: Check MeLiked
		}

		targetQuestion.memberData = await this.memberService.getMember(null, targetQuestion.memberId);
		return targetQuestion;
	}

	/** HELPERS **/

	public async questionStatsEditor(input: StatisticModifier): Promise<QnaQuestion> {
		const { _id, targetKey, modifier } = input;
		return await this.qnaModel
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
