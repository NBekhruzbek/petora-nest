import { Schema, Types } from 'mongoose';
import { ReviewGroup, ReviewStatus } from '../libs/enums/review.enum';

const ReviewSchema = new Schema(
	{
		reviewStatus: {
			type: String,
			enum: ReviewStatus,
			default: ReviewStatus.ACTIVE,
		},

		reviewGroup: {
			type: String,
			enum: ReviewGroup,
			required: true,
		},

		reviewImages: {
			type: [String],
			default: [],
		},

		reviewMessage: {
			type: String,
		},

		reviewRating: {
			type: Number,
			required: true,
		},

		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		reviewRefId: {
			type: Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: 'reviews' },
);

export default ReviewSchema;
