import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderItemInput } from '../../libs/dto/order/order.input';
import { Order } from '../../libs/dto/order/order';
import { Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Member } from '../../libs/dto/member/member';

@Injectable()
export class OrderService {
	constructor(
		@InjectModel('Order') private readonly orderModel: Model<Order>,
		@InjectModel('OrderItem') private readonly orderItemModel: Model<OrderItemInput>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async createOrder(memberId: Types.ObjectId, input: OrderItemInput[]): Promise<Order> {
		const amount = input.reduce((accumlator: number, item: OrderItemInput) => {
			return accumlator + item.itemPrice * item.itemQuantity;
		}, 0);

		const delivery = amount < 100000 ? 5000 : 0;
		const orderNumber = await this.createOrderNumber();
		console.log('ORDER_NUMBER: ', orderNumber);

		const member: Member = await this.memberModel.findById(memberId);
		if (!member) throw new InternalServerErrorException(Message.CREATE_FAILED);

		if (!member.memberAddress || !member.memberPhone)
			throw new InternalServerErrorException(Message.NOT_USER_ADDRESS_OR_PHONE);

		try {
			const newOrder: Order = await this.orderModel.create({
				orderNumber: orderNumber,
				orderTotal: amount + delivery,
				orderDelivery: delivery,
				deliveryAddress: member.memberAddress,
				receiverName: member.memberFullName ? member.memberFullName : member.memberUserName,
				receiverPhone: member.memberPhone,
				memberId: member._id,
			});

			const orderId = newOrder._id;
			await this.recordOrderItem(orderId, input);

			return newOrder;
		} catch (err) {
			console.log('Error, order.model', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	private async createOrderNumber(): Promise<string> {
		return `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
	}

	private async recordOrderItem(orderId: Types.ObjectId, input: OrderItemInput[]): Promise<void> {
		try {
			const promisedList = input.map(async (item: OrderItemInput) => {
				item.orderId = orderId;
				item.productId = shapeIntoMongoObjectId(item.productId);
				await this.orderItemModel.create(item);
				return 'INSERTED';
			});

			const orderItemsState = await Promise.all(promisedList);
			console.log('orderItemsState:', orderItemsState);
		} catch (err) {
			console.log('Error, order.model', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}
}
