import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ArticleCategory, ArticleStatus } from '../../enums/boardArticle.enum';
import { Types } from 'mongoose';
import { availableBoardArticleSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

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

@InputType()
class BAISearch {
	@IsOptional()
	@Field(() => ArticleCategory, { nullable: true })
	articleCategory?: ArticleCategory;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: Types.ObjectId;
}

@InputType()
export class BoardArticlesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableBoardArticleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => BAISearch)
	search: BAISearch;
}

@InputType()
class ABAISearch {
	@IsOptional()
	@Field(() => ArticleStatus, { nullable: true })
	articleStatus?: ArticleStatus;

	@IsOptional()
	@Field(() => ArticleCategory, { nullable: true })
	articleCategory?: ArticleCategory;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class AllBoardArticlesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableBoardArticleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ABAISearch)
	search: ABAISearch;
}
