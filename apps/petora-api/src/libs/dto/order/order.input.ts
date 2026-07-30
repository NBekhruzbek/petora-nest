import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Types } from 'mongoose';
import { OrderStatus } from '../../enums/order.enum';

@InputType()
export class OrderItemInput {
	@IsNotEmpty()
	@Field(() => Int)
	itemQuantity: number;

	@IsNotEmpty()
	@Field(() => Number)
	itemPrice: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	orderId?: Types.ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	productId: Types.ObjectId;
}

@InputType()
export class OrdersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => OrderStatus, { nullable: true })
	orderStatus?: OrderStatus;

	/** Partial, case-insensitive match on `orderNumber` — the reference a
	 *  customer quotes when they get in touch. */
	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}
