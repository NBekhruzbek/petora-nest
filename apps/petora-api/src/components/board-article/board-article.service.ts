import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import {
	AllBoardArticlesInquiry,
	BoardArticleInput,
	BoardArticlesInquiry,
} from '../../libs/dto/board-article/board-article.input';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { Direction, Message } from '../../libs/enums/common.enum';
import { BoardArticleUpdateInput } from '../../libs/dto/board-article/board-article.update';
import { ArticleStatus } from '../../libs/enums/boardArticle.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { MemberService } from '../member/member.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';

@Injectable()
export class BoardArticleService {
	constructor(
		@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
		private readonly viewService: ViewService,
		private readonly memberService: MemberService,
		private readonly likeService: LikeService,
	) {}

	/** MUTATIONS **/

	public async createNewArticle(memberId: Types.ObjectId, input: BoardArticleInput): Promise<BoardArticle> {
		input.memberId = memberId;

		const result: BoardArticle = await this.boardArticleModel.create(input);
		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		await this.memberService.memberStatsEditor({
			_id: result.memberId,
			targetKey: 'memberArticles',
			modifier: 1,
		});

		return result;
	}

	public async updateArticle(memberId: Types.ObjectId, input: BoardArticleUpdateInput): Promise<BoardArticle> {
		input.memberId = memberId;
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

	public async updateBoardArticleByAdmin(input: BoardArticleUpdateInput): Promise<BoardArticle> {
		const { articleId, articleStatus } = input;

		const result = await this.boardArticleModel
			.findOneAndUpdate({ _id: articleId, articleStatus: { $in: [ArticleStatus.ACTIVE, ArticleStatus.HIDE] } }, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (articleStatus === ArticleStatus.DELETE) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberArticles',
				modifier: -1,
			});
		}

		return result;
	}

	public async removeBoardArticlesByAdmin(articleId: Types.ObjectId): Promise<BoardArticle> {
		const search: T = { _id: articleId, articleStatus: ArticleStatus.DELETE };
		const result = await this.boardArticleModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

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

			// Check MeLiked
			const likeInput = {
				memberId: memberId,
				likeRefId: articleId,
				likeGroup: LikeGroup.ARTICLE,
			};
			targetBoardArticle.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		targetBoardArticle.memberData = await this.memberService.getMember(null, targetBoardArticle.memberId);
		return targetBoardArticle;
	}

	public async getBoardArticles(memberId: Types.ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles> {
		const { articleCategory, text } = input.search;
		const match: T = { articleStatus: ArticleStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (articleCategory) match.articleCategory = articleCategory;
		if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
		if (input.search?.memberId) {
			match.memberId = shapeIntoMongoObjectId(input.search.memberId);
		}

		const result = await this.boardArticleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId),
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

	public async likeTargetBoardArticle(memberid: Types.ObjectId, likeRefId: Types.ObjectId): Promise<BoardArticle> {
		const target: BoardArticle = await this.boardArticleModel
			.findOne({ _id: likeRefId, articleStatus: ArticleStatus.ACTIVE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberid,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.ARTICLE,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.boardArticleStatsEditor({
			_id: likeRefId,
			targetKey: 'articleLikes',
			modifier: modifier,
		});
		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

		return result;
	}

	public async getAllBoardArticlesByAdmin(input: AllBoardArticlesInquiry): Promise<BoardArticles> {
		const { articleStatus, articleCategory, text } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (articleStatus) match.articleStatus = articleStatus;
		if (articleCategory) match.articleCategory = articleCategory;
		if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };

		const result = await this.boardArticleModel
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
