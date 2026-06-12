import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { OrderItemInput } from '../../libs/dto/order/order.input';
import { Order } from '../../libs/dto/order/order';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class OrderResolver {
	constructor(private readonly orderService: OrderService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Order)
	public async createOrder(
		@Args('input', { type: () => [OrderItemInput] }) input: OrderItemInput[],
		@AuthMember('_id') _id: string,
	): Promise<Order> {
		console.log('Mutation: createOrder');
		const memberId = shapeIntoMongoObjectId(_id);
		return this.orderService.createOrder(memberId, input);
	}
}
