import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { ArticleCategory, ArticleStatus } from '../../enums/boardArticle.enum';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class BoardArticle {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => ArticleCategory)
	articleCategory: ArticleCategory;

	@Field(() => ArticleStatus)
	articleStatus: ArticleStatus;

	@Field(() => String)
	articleTitle: string;

	@Field(() => String)
	articleContent: string;

	@Field(() => String)
	articleImage: string;

	@Field(() => Int)
	articleLikes: number;

	@Field(() => Int)
	articleViews: number;

	@Field(() => Int)
	articleComments: number;

	@Field(() => String)
	memberId: Types.ObjectId;

	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class BoardArticles {
	@Field(() => [BoardArticle])
	list: BoardArticle[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
