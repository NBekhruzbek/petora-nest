import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

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
