import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { QnaService } from './qna.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { QnaQuestion } from '../../libs/dto/qna/qna';
import { QnaInput } from '../../libs/dto/qna/qna.input';
import { Types } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';

@Resolver()
export class QnaResolver {
	constructor(private readonly qnaService: QnaService) {}
}
