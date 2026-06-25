import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BoardArticle, BoardArticles } from '../../libs/dto/boardArticle/article';
import {
	AllBoardArticlesInquiry,
	BoardArticleInput,
	BoardArticlesInquiry,
} from '../../libs/dto/boardArticle/article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { BoardArticleUpdateInput } from '../../libs/dto/boardArticle/article.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Types } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class BoardArticleResolver {
	constructor(private readonly boardArticleService: BoardArticleService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => BoardArticle)
	public async createNewArticle(
		@Args('input') input: BoardArticleInput,
		@AuthMember('_id') _id: string,
	): Promise<BoardArticle> {
		console.log('Mutation: createNewArticle');
		return this.boardArticleService.createNewArticle(_id, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => BoardArticle)
	public async getBoardArticle(
		@Args('articleId') input: string,
		@AuthMember('_id') memberId: Types.ObjectId | null,
	): Promise<BoardArticle> {
		console.log('Query: getBoardArticle');
		const articleId = shapeIntoMongoObjectId(input);
		return await this.boardArticleService.getBoardArticle(memberId, articleId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => BoardArticle)
	public async updateArticle(
		@Args('input') input: BoardArticleUpdateInput,
		@AuthMember('_id') _id: string,
	): Promise<BoardArticle> {
		console.log('Mutation: updateArticle');
		return this.boardArticleService.updateArticle(_id, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => BoardArticles)
	public async getBoardArticles(
		@Args('input') input: BoardArticlesInquiry,
		@AuthMember('_id') memberId: Types.ObjectId | null,
	): Promise<BoardArticles> {
		console.log('Query: getBoardArticles');
		return await this.boardArticleService.getBoardArticles(memberId, input);
	}

	/** ADMIN */

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => BoardArticles)
	public async getAllBoardArticlesByAdmin(
		@Args('input') input: AllBoardArticlesInquiry,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<BoardArticles> {
		console.log('Query: getAllBoardArticlesByAdmin');
		return await this.boardArticleService.getAllBoardArticlesByAdmin(input);
	}
}
