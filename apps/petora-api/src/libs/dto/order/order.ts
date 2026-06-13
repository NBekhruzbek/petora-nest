import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { OrderStatus, PaymentMethod } from '../../enums/order.enum';
import { Product } from '../product/product';

@ObjectType()
export class OrderItem {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => Int)
	itemQuantity: number;

	@Field(() => Number)
	itemPrice: number;

	@Field(() => String)
	orderId: Types.ObjectId;

	@Field(() => String)
	productId: Types.ObjectId;

	@Field(() => Product, { nullable: true })
	productData?: Product;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

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

	@Field(() => [OrderItem], { nullable: true })
	orderItems?: OrderItem[];

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class OrderTotalCounter {
	@Field(() => Int, { nullable: true })
	total: number;
}

@ObjectType()
export class Orders {
	@Field(() => [Order])
	list: Order[];

	@Field(() => [OrderTotalCounter], { nullable: true })
	metaCounter?: OrderTotalCounter[];
}
