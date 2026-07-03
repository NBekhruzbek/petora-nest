import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ViewService } from '../view/view.service';
import { AllQnaQuestionsInquiry, QnaInput, QnaQuestionInquiry } from '../../libs/dto/qna/qna.input';
import { QnaQuestion, QnaQuestions } from '../../libs/dto/qna/qna';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { QnaStatus } from '../../libs/enums/qna.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { QuestionUpdateInput } from '../../libs/dto/qna/qna.update';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';

@Injectable()
export class QnaService {
	constructor(
		@InjectModel('QNA') private readonly qnaModel: Model<QnaQuestion>,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
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

	public async updateQuestion(memberId: Types.ObjectId, input: QuestionUpdateInput): Promise<QnaQuestion> {
		input.memberId = memberId;
		input.questionId = shapeIntoMongoObjectId(input.questionId);

		const { questionId, ...updateData } = input;

		const search = {
			_id: questionId,
			memberId: updateData.memberId,
			qnaStatus: QnaStatus.ACTIVE,
		};

		const result: QnaQuestion = await this.qnaModel
			.findOneAndUpdate(search, { $set: updateData }, { new: true })
			.exec();
		if (!result) throw new BadRequestException(Message.UPDATE_FAILED);

		return result;
	}

	public async updateQnaQuestionByAdmin(input: QuestionUpdateInput): Promise<QnaQuestion> {
		const { questionId, ...updateData } = input;

		const result = await this.qnaModel
			.findOneAndUpdate({ _id: questionId, qnaStatus: { $in: [QnaStatus.ACTIVE, QnaStatus.HIDE] } }, updateData, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (updateData.qnaStatus === QnaStatus.DELETE) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberQuestions',
				modifier: -1,
			});
		}

		return result;
	}

	public async removeQnaQuestionByAdmin(questionId: Types.ObjectId): Promise<QnaQuestion> {
		const search: T = { _id: questionId, qnaStatus: QnaStatus.DELETE };
		const result = await this.qnaModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async likeTargetQuestion(memberid: Types.ObjectId, likeRefId: Types.ObjectId): Promise<QnaQuestion> {
		const target: QnaQuestion = await this.qnaModel.findOne({ _id: likeRefId, qnaStatus: QnaStatus.ACTIVE }).exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberid,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.QNA,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.questionStatsEditor({
			_id: likeRefId,
			targetKey: 'questionLikes',
			modifier: modifier,
		});
		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

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

			//  Check MeLiked
			const likeInput = {
				memberId: memberId,
				likeRefId: questionId,
				likeGroup: LikeGroup.QNA,
			};
			targetQuestion.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		targetQuestion.memberData = await this.memberService.getMember(null, targetQuestion.memberId);
		return targetQuestion;
	}

	public async getQuestions(memberId: Types.ObjectId, input: QnaQuestionInquiry): Promise<QnaQuestions> {
		const { text } = input.search;
		const match: T = { qnaStatus: QnaStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (text)
			match.$or = [
				{ questionTitle: { $regex: new RegExp(text, 'i') } },
				{ questionContent: { $regex: new RegExp(text, 'i') } },
			];
		if (input.search?.memberId) {
			match.memberId = shapeIntoMongoObjectId(input.search.memberId);
		}

		const result = await this.qnaModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async getAllQuestionsByAdmin(input: AllQnaQuestionsInquiry): Promise<QnaQuestions> {
		const { qnaStatus, text, memberId } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (qnaStatus) match.qnaStatus = qnaStatus;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (text)
			match.$or = [
				{ questionTitle: { $regex: new RegExp(text, 'i') } },
				{ questionContent: { $regex: new RegExp(text, 'i') } },
			];

		const result = await this.qnaModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new BadRequestException(Message.NO_DATA_FOUND);

		return result[0];
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
