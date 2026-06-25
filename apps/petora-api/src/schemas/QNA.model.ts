import { Schema, Types } from 'mongoose';
import { QnaStatus } from '../libs/enums/qna.enum';

const QnaSchema = new Schema(
	{
		qnaStatus: {
			type: String,
			enum: QnaStatus,
			default: QnaStatus.ACTIVE,
		},

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
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'QNAs' },
);

export default QnaSchema;
