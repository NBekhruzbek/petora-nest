import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BoardArticle } from '../../libs/dto/boardArticle/article';
import { BoardArticleInput } from '../../libs/dto/boardArticle/article.input';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class BoardArticleService {
	constructor(@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>) {}

	public async createNewArticle(memberId: string, input: BoardArticleInput): Promise<BoardArticle> {
		input.memberId = shapeIntoMongoObjectId(memberId);

		const result: BoardArticle = await this.boardArticleModel.create(input);
		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		return result;
	}
}
