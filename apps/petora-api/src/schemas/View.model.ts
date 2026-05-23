import { Schema, Types } from 'mongoose';
import { ViewGroup } from '../libs/enums/view.enum';

const ViewSchema = new Schema(
	{
		viewGroup: {
			type: String,
			enum: ViewGroup,
			required: true,
		},

		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'members',
		},

		viewRefId: {
			type: Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: 'views' },
);

export default ViewSchema;
