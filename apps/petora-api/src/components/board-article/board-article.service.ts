import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BoardArticle } from '../../libs/dto/boardArticle/article';
import { BoardArticleInput } from '../../libs/dto/boardArticle/article.input';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import { BoardArticleUpdateInput } from '../../libs/dto/boardArticle/article.update';
import { ArticleStatus } from '../../libs/enums/boardArticle.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { MemberService } from '../member/member.service';

@Injectable()
export class BoardArticleService {
	constructor(
		@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
		private readonly viewService: ViewService,
		private readonly memberService: MemberService,
	) {}

	/** MUTATIONS **/

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

	/** QUERIES**/

	public async getBoardArticle(memberId: Types.ObjectId, articleId: Types.ObjectId): Promise<BoardArticle> {
		const search: T = {
			_id: articleId,
			articleStatus: ArticleStatus.ACTIVE,
		};

		const targetBoardArticle: BoardArticle = await this.boardArticleModel.findOne(search).lean().exec();
		if (!targetBoardArticle) throw new BadRequestException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: articleId, viewGroup: ViewGroup.ARTICLE };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.boardArticleStatsEditor({ _id: articleId, targetKey: 'articleViews', modifier: 1 });
				targetBoardArticle.articleViews++;
			}

			// TODO: Check MeLiked
		}

		targetBoardArticle.memberData = await this.memberService.getMember(null, targetBoardArticle.memberId);
		return targetBoardArticle;
	}

	/** HELPERS **/

	public async boardArticleStatsEditor(input: StatisticModifier): Promise<BoardArticle> {
		const { _id, targetKey, modifier } = input;
		return await this.boardArticleModel
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
