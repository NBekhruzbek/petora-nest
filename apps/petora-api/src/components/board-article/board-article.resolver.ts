import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BoardArticle } from '../../libs/dto/boardArticle/article';
import { BoardArticleInput } from '../../libs/dto/boardArticle/article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';

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
}
