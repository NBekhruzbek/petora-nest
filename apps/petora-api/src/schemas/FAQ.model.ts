import { Schema } from 'mongoose';
import { FaqStatus, FaqType } from '../libs/enums/faq.enum';

const FaqSchema = new Schema(
	{
		faqType: {
			type: String,
			enum: FaqType,
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
	},
	{ timestamps: true, collection: 'faqs' },
);

export default FaqSchema;
