import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '../../libs/dto/comment/comment';
import { QnaService } from '../qna/qna.service';
import { BoardArticleService } from '../board-article/board-article.service';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment>,
		private readonly qnaService: QnaService,
		private readonly boardArticleService: BoardArticleService,
	) {}
}
