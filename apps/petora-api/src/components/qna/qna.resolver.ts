import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { QnaService } from './qna.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { QnaQuestion, QnaQuestions } from '../../libs/dto/qna/qna';
import { AllQnaQuestionsInquiry, QnaInput, QnaQuestionInquiry } from '../../libs/dto/qna/qna.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Types } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { QuestionUpdateInput } from '../../libs/dto/qna/qna.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class QnaResolver {
	constructor(private readonly qnaService: QnaService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => QnaQuestion)
	public async createNewQuestion(
		@Args('input') input: QnaInput,
		@AuthMember('_id') _id: Types.ObjectId,
	): Promise<QnaQuestion> {
		console.log('Mutation: createNewQuestion');
		return this.qnaService.createNewQuestion(_id, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => QnaQuestion)
	public async getQuestion(
		@Args('questionId') input: string,
		@AuthMember('_id') memberId: Types.ObjectId | null,
	): Promise<QnaQuestion> {
		console.log('Query: getQuestion');
		const questionId = shapeIntoMongoObjectId(input);
		return await this.qnaService.getQuestion(memberId, questionId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => QnaQuestion)
	public async updateQuestion(
		@Args('input') input: QuestionUpdateInput,
		@AuthMember('_id') _id: Types.ObjectId,
	): Promise<QnaQuestion> {
		console.log('Mutation: updateQuestion');
		return this.qnaService.updateQuestion(_id, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => QnaQuestions)
	public async getQuestions(
		@Args('input') input: QnaQuestionInquiry,
		@AuthMember('_id') memberId: Types.ObjectId | null,
	): Promise<QnaQuestions> {
		console.log('Query: getQuestions');
		return await this.qnaService.getQuestions(memberId, input);
	}

	/** ADMIN */

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => QnaQuestions)
	public async getAllQuestionsByAdmin(
		@Args('input') input: AllQnaQuestionsInquiry,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<QnaQuestions> {
		console.log('Query: getAllQuestionsByAdmin');
		return await this.qnaService.getAllQuestionsByAdmin(input);
	}
}
