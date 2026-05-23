import { Schema, Types } from 'mongoose';

const OrderItemSchema = new Schema(
	{
		itemQuantity: {
			type: Number,
			default: 0,
		},

		itemPrice: {
			type: Number,
			default: 0,
		},

		itemDeliveryPrice: {
			type: Number,
			default: 0,
		},

		productId: {
			type: Types.ObjectId,
			required: true,
			ref: 'products',
		},
	},
	{ timestamps: true, collection: 'orderItems' },
);

export default OrderItemSchema;
