import { Schema, Types } from 'mongoose';
import { LikeGroup } from '../libs/enums/like.enum';

const LikeSchema = new Schema(
	{
		likeGroup: {
			type: String,
			enum: LikeGroup,
			required: true,
		},

		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		likeRefId: {
			type: Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: 'likes' },
);

export default LikeSchema;
