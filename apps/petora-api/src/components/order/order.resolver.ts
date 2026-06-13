import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { OrderItemInput, OrdersInquiry } from '../../libs/dto/order/order.input';
import { Order, Orders } from '../../libs/dto/order/order';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrderUpdateInput } from '../../libs/dto/order/order.update';

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

	@UseGuards(AuthGuard)
	@Query(() => Orders)
	public async getMyOrders(@Args('input') input: OrdersInquiry, @AuthMember('_id') _id: string): Promise<Orders> {
		console.log('Query: getMyOrders');
		const memberId = shapeIntoMongoObjectId(_id);
		return this.orderService.getMyOrders(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Orders)
	public async getAllOrdersByAdmin(@Args('input') input: OrdersInquiry): Promise<Orders> {
		console.log('Query: getAllOrdersByAdmin');
		return this.orderService.getAllOrdersByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Order)
	public async updateOrderByAdmin(@Args('input') input: OrderUpdateInput): Promise<Order> {
		console.log('Mutation: updateOrderByAdmin');
		return this.orderService.updateOrderByAdmin(input);
	}
}
