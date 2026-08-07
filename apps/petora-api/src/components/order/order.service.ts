import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderItemInput, OrdersInquiry } from '../../libs/dto/order/order.input';
import { Order, Orders } from '../../libs/dto/order/order';
import { Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Member } from '../../libs/dto/member/member';
import { Product } from '../../libs/dto/product/product';
import { OrderUpdateInput } from '../../libs/dto/order/order.update';
import { MemberService } from '../member/member.service';
import { ProductService } from '../product/product.service';
import { NotificationService } from '../notification/notification.service';
import { MailService } from '../mail/mail.service';
import { InvoiceLine } from '../mail/mail.templates';
import { PortonePayment, PortoneService } from '../payment/portone.service';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { OrderStatus } from '../../libs/enums/order.enum';
import { ProductStatus } from '../../libs/enums/product.enum';
import { T } from '../../libs/types/common';

const DELIVERY_FEE = 4000;
const FREE_DELIVERY_THRESHOLD = 50000;

@Injectable()
export class OrderService {
	constructor(
		@InjectModel('Order') private readonly orderModel: Model<Order>,
		@InjectModel('OrderItem') private readonly orderItemModel: Model<OrderItemInput>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Product') private readonly productModel: Model<Product>,
		private readonly memberService: MemberService,
		private readonly productService: ProductService,
		private readonly notificationService: NotificationService,
		private readonly mailService: MailService,
		private readonly portoneService: PortoneService,
	) {}

	public async createOrder(memberId: Types.ObjectId, input: OrderItemInput[], paymentId: string): Promise<Order> {
		if (!input?.length) throw new BadRequestException(Message.BAD_REQUEST);

		const alreadyPlaced = await this.orderModel.findOne({ paymentId }).exec();
		if (alreadyPlaced) return alreadyPlaced;

		const member: Member = await this.memberModel.findById(memberId);
		if (!member) throw new InternalServerErrorException(Message.CREATE_FAILED);

		if (!member.memberAddress || !member.memberPhone)
			throw new InternalServerErrorException(Message.NOT_USER_ADDRESS_OR_PHONE);

		const { amount, items, lines } = await this.priceOrderItems(input);
		const delivery = amount < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
		const orderTotal = amount + delivery;

		const payment = await this.portoneService.verifyPaid(paymentId, orderTotal);
		this.assertPaymentRaisedBy(payment, memberId);

		const orderNumber = await this.createOrderNumber();
		console.log('ORDER_NUMBER: ', orderNumber);

		try {
			const newOrder: Order = await this.orderModel.create({
				orderNumber: orderNumber,
				orderTotal: orderTotal,
				orderDelivery: delivery,
				paymentId: paymentId,
				paymentMethod: this.portoneService.toPaymentMethod(payment),
				deliveryAddress: member.memberAddress,
				receiverName: member.memberFullName ? member.memberFullName : member.memberUserName,
				receiverPhone: member.memberPhone,
				memberId: member._id,
			});

			const orderId = newOrder._id;
			await this.recordOrderItem(orderId, items);

			await this.memberService.updateMemberPoint(memberId, 1);

			await this.notificationService.createNotification({
				notificationType: NotificationType.ORDER_CREATED,
				notificationGroup: NotificationGroup.ORDERS,
				notificationTitle: 'Order confirmed',
				notificationContent: `Order ${newOrder.orderNumber} for ${this.formatWon(newOrder.orderTotal)} has been placed.`,
				notificationRefId: newOrder._id,
				receiverId: memberId,
			});

			if (member.memberEmail) {
				void this.mailService.sendOrderInvoice(member.memberEmail, newOrder, lines);
			}

			return newOrder;
		} catch (err) {
			console.log('Error, order.model', err instanceof Error ? err.message : err);
			await this.portoneService.cancelPayment(paymentId, 'Order could not be recorded');
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	private async priceOrderItems(
		input: OrderItemInput[],
	): Promise<{ amount: number; items: OrderItemInput[]; lines: InvoiceLine[] }> {
		const requested = input.map((item) => ({
			...item,
			productId: shapeIntoMongoObjectId(item.productId),
			itemQuantity: Math.trunc(item.itemQuantity),
		}));

		if (requested.some((item) => !Number.isFinite(item.itemQuantity) || item.itemQuantity < 1))
			throw new BadRequestException(Message.BAD_REQUEST);

		const products: Product[] = await this.productModel
			.find({ _id: { $in: requested.map((item) => item.productId) }, productStatus: ProductStatus.ACTIVE })
			.exec();

		const productById = new Map(products.map((product) => [product._id.toString(), product]));

		let amount = 0;
		const lines: InvoiceLine[] = [];
		const items = requested.map((item) => {
			const product = productById.get(item.productId.toString());

			if (!product) throw new BadRequestException(Message.NO_DATA_FOUND);

			const itemPrice = this.sellingPrice(product);
			amount += itemPrice * item.itemQuantity;
			lines.push({ name: product.productName, quantity: item.itemQuantity, price: itemPrice });
			return { ...item, itemPrice };
		});

		return { amount, items, lines };
	}

	/** What the shop actually charges — the discounted price when one applies. */
	private sellingPrice(product: Product): number {
		return product.productDiscount > 0 && product.productPriceAfterDiscount != null
			? product.productPriceAfterDiscount
			: product.productPrice;
	}

	private assertPaymentRaisedBy(payment: PortonePayment, memberId: Types.ObjectId): void {
		let paidBy: string | undefined;
		try {
			paidBy = payment.customData ? JSON.parse(payment.customData)?.memberId : undefined;
		} catch {
			paidBy = undefined;
		}

		if (paidBy !== memberId.toString()) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
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
		this.shapeOrdersMatch(match, input);

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
		this.shapeOrdersMatch(match, input);

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

		await this.notifyBuyerOfOrderStatus(result);

		return result;
	}

	/** HELPERS **/

	/**
	 * The filters `getMyOrders` and `getAllOrdersByAdmin` share, so a new one
	 * cannot land on only half of them.
	 *
	 * `text` is escaped before it reaches RegExp: order numbers contain hyphens
	 * and an admin part-typing "ORD-(" would otherwise throw an unterminated
	 * group and 500 the request.
	 */
	private shapeOrdersMatch(match: T, input: OrdersInquiry): void {
		if (input.orderStatus) match.orderStatus = input.orderStatus;

		const text = input.text?.trim();
		if (text) {
			const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			match.orderNumber = { $regex: new RegExp(escaped, 'i') };
		}
	}

	/**
	 * PROCESSED is the state an order is created in, so it is deliberately absent
	 * here — only transitions the buyer has not already seen are worth a
	 * notification. EN_ROUTE reuses ORDER_SHIPPED because the notification UI
	 * treats both as the same shipping-progress event.
	 */
	private async notifyBuyerOfOrderStatus(order: Order): Promise<void> {
		const copy: Partial<Record<OrderStatus, { type: NotificationType; title: string; body: string }>> = {
			[OrderStatus.SHIPPED]: {
				type: NotificationType.ORDER_SHIPPED,
				title: 'Order shipped',
				body: 'has left the warehouse.',
			},
			[OrderStatus.EN_ROUTE]: {
				type: NotificationType.ORDER_SHIPPED,
				title: 'Order out for delivery',
				body: 'is on its way to you.',
			},
			[OrderStatus.ARRIVED]: {
				type: NotificationType.ORDER_DELIVERED,
				title: 'Order arrived',
				body: 'has arrived. Leave a review to help other pet owners.',
			},
			[OrderStatus.CANCELLED]: {
				type: NotificationType.ORDER_CANCELLED,
				title: 'Order cancelled',
				body: 'has been cancelled.',
			},
		};

		const entry = copy[order.orderStatus];
		if (!entry) return;

		await this.notificationService.createNotification({
			notificationType: entry.type,
			notificationGroup: NotificationGroup.ORDERS,
			notificationTitle: entry.title,
			notificationContent: `Order ${order.orderNumber} ${entry.body}`,
			notificationRefId: order._id,
			receiverId: order.memberId,
		});
	}

	private formatWon(value: number): string {
		return `₩${(value ?? 0).toLocaleString()}`;
	}
}
