import { Schema, Types } from 'mongoose';
import { OrderStatus, PaymentMethod } from '../libs/enums/order.enum';

const OrderSchema = new Schema(
	{
		orderNumber: {
			type: String,
		},

		orderTotal: {
			type: Number,
			required: true,
		},

		orderDelivery: {
			type: Number,
			default: 0,
		},

		orderStatus: {
			type: String,
			enum: OrderStatus,
			default: OrderStatus.PENDING,
		},

		paymentMethod: {
			type: String,
			enum: PaymentMethod,
			default: PaymentMethod.CARD,
		},

		deliveryAddress: {
			type: String,
			required: true,
		},

		receiverName: {
			type: String,
			required: true,
		},

		receiverPhone: {
			type: String,
			required: true,
		},

		orderItemsRefId: {
			type: Types.ObjectId,
			required: true,
			ref: 'orderItems',
		},

		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'members',
		},
	},
	{ timestamps: true, collection: 'orders' },
);

export default OrderSchema;
