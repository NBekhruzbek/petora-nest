import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ArticleCategory, ArticleStatus } from '../../enums/boardArticle.enum';
import { Types } from 'mongoose';

@InputType()
export class BoardArticleUpdateInput {
	@IsNotEmpty()
	@Field(() => String)
	articleId: Types.ObjectId;

	@IsOptional()
	@Field(() => ArticleCategory, { nullable: true })
	articleCategory?: ArticleCategory;

	@IsOptional()
	@Field(() => ArticleStatus, { nullable: true })
	articleStatus?: ArticleStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	articleTitle?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	articleContent?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	articleImage?: string;

	memberId: Types.ObjectId;
}
