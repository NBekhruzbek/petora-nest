import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderItemInput, OrdersInquiry } from '../../libs/dto/order/order.input';
import { Order, Orders } from '../../libs/dto/order/order';
import { Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Member } from '../../libs/dto/member/member';
import { OrderUpdateInput } from '../../libs/dto/order/order.update';
import { MemberService } from '../member/member.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
	constructor(
		@InjectModel('Order') private readonly orderModel: Model<Order>,
		@InjectModel('OrderItem') private readonly orderItemModel: Model<OrderItemInput>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly memberService: MemberService,
		private readonly productService: ProductService,
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

			await this.memberService.updateMemberPoint(memberId, 1);

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
				await this.productService.productStatsEditor({
					_id: item.productId,
					targetKey: 'productSoldTimes',
					modifier: 1,
				});
				return 'INSERTED';
			});

			const orderItemsState = await Promise.all(promisedList);
			console.log('orderItemsState:', orderItemsState);
		} catch (err) {
			console.log('Error, order.model', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	public async getMyOrders(memberId: Types.ObjectId, input: OrdersInquiry): Promise<Orders> {
		const match: any = { memberId };
		if (input.orderStatus) match.orderStatus = input.orderStatus;

		const result = await this.orderModel
			.aggregate([
				{ $match: match },
				{
					$facet: {
						list: [
							{ $sort: { updatedAt: -1 } },
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'orderItems',
									let: { orderId: '$_id' },
									pipeline: [
										{
											$match: {
												$expr: { $eq: ['$orderId', '$$orderId'] },
											},
										},
										{
											$lookup: {
												from: 'products',
												localField: 'productId',
												foreignField: '_id',
												as: 'productData',
											},
										},
										{
											$unwind: {
												path: '$productData',
												preserveNullAndEmptyArrays: true,
											},
										},
									],
									as: 'orderItems',
								},
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		// If there is no data, return an empty list.
		return result[0];
	}

	public async getAllOrdersByAdmin(input: OrdersInquiry): Promise<Orders> {
		const match: any = {};
		if (input.orderStatus) match.orderStatus = input.orderStatus;

		const result = await this.orderModel
			.aggregate([
				{ $match: match },
				{
					$facet: {
						list: [
							{ $sort: { updatedAt: -1 } },
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'orderItems',
									let: { orderId: '$_id' },
									pipeline: [
										{
											$match: {
												$expr: { $eq: ['$orderId', '$$orderId'] },
											},
										},
										{
											$lookup: {
												from: 'products',
												localField: 'productId',
												foreignField: '_id',
												as: 'productData',
											},
										},
										{
											$unwind: {
												path: '$productData',
												preserveNullAndEmptyArrays: true,
											},
										},
									],
									as: 'orderItems',
								},
							},
							{
								$lookup: {
									from: 'members',
									localField: 'memberId',
									foreignField: '_id',
									as: 'memberData',
								},
							},
							{
								$unwind: {
									path: '$memberData',
									preserveNullAndEmptyArrays: true,
								},
							},
							{
								$project: {
									'memberData.memberPassword': 0,
									'memberData.accessToken': 0,
								},
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		// If there is no data, return an empty list.
		return result[0];
	}

	public async updateOrderByAdmin(input: OrderUpdateInput): Promise<Order> {
		const orderId = shapeIntoMongoObjectId(input.orderId);

		const result: Order = await this.orderModel
			.findOneAndUpdate({ _id: orderId }, { orderStatus: input.orderStatus }, { new: true })
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}
}
