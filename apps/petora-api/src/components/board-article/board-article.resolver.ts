import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BoardArticle } from '../../libs/dto/boardArticle/article';
import { BoardArticleInput } from '../../libs/dto/boardArticle/article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { BoardArticleUpdateInput } from '../../libs/dto/boardArticle/article.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Types } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

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
}
