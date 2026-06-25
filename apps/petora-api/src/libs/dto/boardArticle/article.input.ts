import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ArticleCategory } from '../../enums/boardArticle.enum';

@InputType()
export class BoardArticleInput {
	@IsNotEmpty()
	@Field(() => ArticleCategory)
	articleCategory: ArticleCategory;

	@IsNotEmpty()
	@Field(() => String)
	articleTitle: string;

	@IsNotEmpty()
	@Field(() => String)
	articleContent: string;

	@IsNotEmpty()
	@Field(() => String)
	articleImage: string;

	memberId: string;
}
