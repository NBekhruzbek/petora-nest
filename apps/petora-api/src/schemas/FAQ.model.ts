import { Schema, Types } from 'mongoose';
import { FaqStatus, FaqType } from '../libs/enums/faq.enum';

const FaqSchema = new Schema(
	{
		faqType: {
			type: String,
			enum: FaqType,
			required: true,
		},

		faqStatus: {
			type: String,
			enum: FaqStatus,
			default: FaqStatus.ACTIVE,
		},

		faqTitle: {
			type: String,
			required: true,
		},

		faqContent: {
			type: String,
			required: true,
		},

		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'faqs' },
);

export default FaqSchema;
