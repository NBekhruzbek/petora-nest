import { Schema } from 'mongoose';
import { NoticeType } from '../libs/enums/notice.enum';

const NoticeSchema = new Schema(
	{
		noticeCategory: {
			type: String,
			enum: NoticeType,
			required: true,
		},

		noticeTitle: {
			type: String,
			required: true,
		},

		noticeSummary: {
			type: String,
		},

		noticeContent: {
			type: String,
			required: true,
		},

		date: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true, collection: 'notices' },
);

export default NoticeSchema;
