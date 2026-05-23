import { Schema, Types } from 'mongoose';
import { ReceiptGroup } from '../libs/enums/receipt.enum';

const ReceiptSchema = new Schema(
	{
		receiptNumber: {
			type: String,
			required: true,
		},

		orderNumber: {
			type: String,
			required: true,
		},

		receiptGroup: {
			type: String,
			enum: ReceiptGroup,
			required: true,
		},

		itemQuantity: {
			type: Number,
			default: 0,
		},

		itemPrice: {
			type: Number,
			default: 0,
		},

		deliveryAddress: {
			type: String,
			required: true,
		},

		clientName: {
			type: String,
			required: true,
		},

		clientPhone: {
			type: String,
			required: true,
		},

		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'members',
		},

		receiptRefId: {
			type: Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: 'receipts' },
);

export default ReceiptSchema;
