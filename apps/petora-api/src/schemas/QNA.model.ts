import { Schema, Types } from 'mongoose';

const QnaSchema = new Schema(
	{
		questionTitle: {
			type: String,
			required: true,
		},

		questionContent: {
			type: String,
			required: true,
		},

		questionImages: {
			type: [String],
			default: [],
		},

		questionLikes: {
			type: Number,
			default: 0,
		},

		questionViews: {
			type: Number,
			default: 0,
		},

		questionAnswers: {
			type: Number,
			default: 0,
		},

		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'members',
		},
	},
	{ timestamps: true, collection: 'QNAs' },
);

export default QnaSchema;
