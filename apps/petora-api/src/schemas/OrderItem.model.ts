import { Schema, Types } from 'mongoose';

const OrderItemSchema = new Schema(
	{
		itemQuantity: {
			type: Number,
			required: true,
		},

		itemPrice: {
			type: Number,
			required: true,
		},

		orderId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Order',
		},

		productId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Product',
		},
	},
	{ timestamps: true, collection: 'orderItems' },
);

export default OrderItemSchema;
