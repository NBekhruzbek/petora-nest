import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BoardArticle } from '../../libs/dto/boardArticle/article';
import { BoardArticleInput } from '../../libs/dto/boardArticle/article.input';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import { BoardArticleUpdateInput } from '../../libs/dto/boardArticle/article.update';
import { ArticleStatus } from '../../libs/enums/boardArticle.enum';

@Injectable()
export class BoardArticleService {
	constructor(@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>) {}

	public async createNewArticle(memberId: string, input: BoardArticleInput): Promise<BoardArticle> {
		input.memberId = shapeIntoMongoObjectId(memberId);

		const result: BoardArticle = await this.boardArticleModel.create(input);
		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		return result;
	}

	public async updateArticle(memberId: string, input: BoardArticleUpdateInput): Promise<BoardArticle> {
		input.memberId = shapeIntoMongoObjectId(memberId);
		input.articleId = shapeIntoMongoObjectId(input.articleId);

		const { articleId, ...updateData } = input;

		const search = {
			_id: articleId,
			memberId: updateData.memberId,
			articleStatus: ArticleStatus.ACTIVE,
		};

		const result: BoardArticle = await this.boardArticleModel
			.findOneAndUpdate(search, { $set: updateData }, { new: true })
			.exec();
		if (!result) throw new BadRequestException(Message.UPDATE_FAILED);

		return result;
	}
}
