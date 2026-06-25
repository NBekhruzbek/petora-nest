import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { QnaService } from './qna.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { QnaQuestion } from '../../libs/dto/qna/qna';
import { QnaInput } from '../../libs/dto/qna/qna.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Types } from 'mongoose';

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
}
