import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminDashboardStats } from '../../libs/dto/admin/admin';
import { Member } from '../../libs/dto/member/member';
import { Product } from '../../libs/dto/product/product';
import { Order } from '../../libs/dto/order/order';
import { BookedInfo } from '../../libs/dto/booking/booking';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { ProductStatus } from '../../libs/enums/product.enum';
import { OrderStatus } from '../../libs/enums/order.enum';
import { BookingPaymentStatus, BookingStatus } from '../../libs/enums/booking.enum';

@Injectable()
export class AdminService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Product') private readonly productModel: Model<Product>,
		@InjectModel('Order') private readonly orderModel: Model<Order>,
		@InjectModel('Booking') private readonly bookingModel: Model<BookedInfo>,
	) {}

	public async getAdminDashboardStats(): Promise<AdminDashboardStats> {
		// Deleted members and products are excluded so the cards match what the
		// management tables show by default; orders are never soft-deleted.
		const [
			totalUsers,
			totalAgents,
			totalProducts,
			totalOrders,
			pendingOrders,
			totalBookings,
			pendingBookings,
			orderRevenue,
			bookingRevenue,
		] = await Promise.all([
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
			this.bookingModel.countDocuments({}),
			// Bookings the agent has not answered yet.
			this.bookingModel.countDocuments({ bookingStatus: BookingStatus.PENDING }),
			this.orderModel
				.aggregate([
					{ $match: { orderStatus: { $ne: OrderStatus.CANCELLED } } },
					{ $group: { _id: null, total: { $sum: '$orderTotal' } } },
				])
				.exec(),
			// Only money that actually landed: an unpaid booking would inflate the
			// figure, and a refunded one already gave it back.
			this.bookingModel
				.aggregate([
					{ $match: { bookingPaymentStatus: BookingPaymentStatus.PAID } },
					{ $group: { _id: null, total: { $sum: '$bookingPrice' } } },
				])
				.exec(),
		]);

		return {
			totalUsers,
			totalAgents,
			totalProducts,
			totalOrders,
			pendingOrders,
			totalBookings,
			pendingBookings,
			totalRevenue: (orderRevenue[0]?.total ?? 0) + (bookingRevenue[0]?.total ?? 0),
		};
	}
}
