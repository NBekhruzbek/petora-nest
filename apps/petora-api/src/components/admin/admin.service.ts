import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminDashboardStats } from '../../libs/dto/admin/admin';
import { Member } from '../../libs/dto/member/member';
import { Product } from '../../libs/dto/product/product';
import { Order } from '../../libs/dto/order/order';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { ProductStatus } from '../../libs/enums/product.enum';
import { OrderStatus } from '../../libs/enums/order.enum';

@Injectable()
export class AdminService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Product') private readonly productModel: Model<Product>,
		@InjectModel('Order') private readonly orderModel: Model<Order>,
	) {}

	public async getAdminDashboardStats(): Promise<AdminDashboardStats> {
		// Deleted members and products are excluded so the cards match what the
		// management tables show by default; orders are never soft-deleted.
		const [totalUsers, totalAgents, totalProducts, totalOrders, pendingOrders, revenue] = await Promise.all([
			this.memberModel.countDocuments({
				memberType: MemberType.USER,
				memberStatus: { $ne: MemberStatus.DELETE },
			}),
			this.memberModel.countDocuments({
				memberType: MemberType.AGENT,
				memberStatus: { $ne: MemberStatus.DELETE },
			}),
			this.productModel.countDocuments({ productStatus: { $ne: ProductStatus.DELETE } }),
			this.orderModel.countDocuments({}),
			// Orders still sitting in the state they were created in — nothing has
			// been shipped yet, so these are the ones needing an admin.
			this.orderModel.countDocuments({ orderStatus: OrderStatus.PROCESSED }),
			this.orderModel
				.aggregate([
					{ $match: { orderStatus: { $ne: OrderStatus.CANCELLED } } },
					{ $group: { _id: null, total: { $sum: '$orderTotal' } } },
				])
				.exec(),
		]);

		return {
			totalUsers,
			totalAgents,
			totalProducts,
			totalOrders,
			pendingOrders,
			totalRevenue: revenue[0]?.total ?? 0,
		};
	}
}
