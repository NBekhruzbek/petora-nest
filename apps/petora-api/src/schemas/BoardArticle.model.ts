import { Schema, Types } from 'mongoose';
import { ArticleCategory, ArticleStatus } from '../libs/enums/boardArticle.enum';

const BoardArticleSchema = new Schema(
	{
		articleCategory: {
			type: String,
			enum: ArticleCategory,
		},

		articleStatus: {
			type: String,
			enum: ArticleStatus,
			default: ArticleStatus.ACTIVE,
		},

		articleTitle: {
			type: String,
			required: true,
		},

		articleContent: {
			type: String,
			required: true,
		},

		articleImage: {
			type: String,
			required: true,
		},

		articleLikes: {
			type: Number,
			default: 0,
		},

		articleViews: {
			type: Number,
			default: 0,
		},

		articleComments: {
			type: Number,
			default: 0,
		},

		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'members',
		},
	},
	{ timestamps: true, collection: 'boardArticles' },
);

export default BoardArticleSchema;
