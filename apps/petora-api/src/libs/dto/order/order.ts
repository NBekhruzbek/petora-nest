import { Field, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { OrderStatus, PaymentMethod } from '../../enums/order.enum';

@ObjectType()
export class Order {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => String)
	orderNumber: string;

	@Field(() => Number)
	orderTotal: number;

	@Field(() => Number)
	orderDelivery: number;

	@Field(() => OrderStatus)
	orderStatus: OrderStatus;

	@Field(() => PaymentMethod)
	paymentMethod: PaymentMethod;

	@Field(() => String)
	deliveryAddress: string;

	@Field(() => String)
	receiverName: string;

	@Field(() => String)
	receiverPhone: string;

	@Field(() => String)
	memberId: Types.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
