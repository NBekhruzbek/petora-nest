import { Schema, Types } from 'mongoose';
import { NoticeStatus, NoticeType } from '../libs/enums/notice.enum';

const NoticeSchema = new Schema(
	{
		noticeType: {
			type: String,
			enum: NoticeType,
			required: true,
		},

		noticeStatus: {
			type: String,
			enum: NoticeStatus,
			default: NoticeStatus.HIDE,
		},

		noticeTitle: {
			type: String,
			required: true,
		},

		noticeSummary: {
			type: String,
			required: true,
		},

		noticeContent: {
			type: String,
			required: true,
		},

		noticeViews: {
			type: Number,
			default: 0,
		},

		memberId: {
			type: Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: 'notices' },
);

export default NoticeSchema;
