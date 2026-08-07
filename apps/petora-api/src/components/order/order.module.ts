import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import OrderSchema from '../../schemas/Order.model';
import OrderItemSchema from '../../schemas/OrderItem.model';
import MemberSchema from '../../schemas/Member.model';
import ProductSchema from '../../schemas/Product.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { ProductModule } from '../product/product.module';
import { NotificationModule } from '../notification/notification.module';
import { MailModule } from '../mail/mail.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Order',
				schema: OrderSchema,
			},
			{
				name: 'OrderItem',
				schema: OrderItemSchema,
			},
			{
				name: 'Member',
				schema: MemberSchema,
			},
			{
				name: 'Product',
				schema: ProductSchema,
			},
		]),
		AuthModule,
		MemberModule,
		ProductModule,
		NotificationModule,
		MailModule,
		PaymentModule,
	],
	providers: [OrderResolver, OrderService],
})
export class OrderModule {}
