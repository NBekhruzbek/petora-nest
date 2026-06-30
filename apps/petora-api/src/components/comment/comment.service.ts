import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from '../../libs/dto/comment/comment';
import { QnaService } from '../qna/qna.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { CommentInput } from '../../libs/dto/comment/comment.input';
import { Message } from '../../libs/enums/common.enum';
import { CommentGroup } from '../../libs/enums/comment.enum';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment>,
		private readonly qnaService: QnaService,
		private readonly boardArticleService: BoardArticleService,
	) {}

	/** MUTATIONS **/

	public async createComment(memberId: Types.ObjectId, input: CommentInput): Promise<Comment> {
		input.memberId = memberId;

		let result = null;
		try {
			result = await this.commentModel.create(input);
		} catch (err) {
			console.log('Error, Comment.Model:', err instanceof Error ? err.message : err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		switch (input.commentGroup) {
			case CommentGroup.QNA:
				await this.qnaService.questionStatsEditor({
					_id: input.commentRefId,
					targetKey: 'questionAnswers',
					modifier: 1,
				});
			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStatsEditor({
					_id: input.commentRefId,
					targetKey: 'articleComments',
					modifier: 1,
				});
				break;
		}

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return result;
	}
}
