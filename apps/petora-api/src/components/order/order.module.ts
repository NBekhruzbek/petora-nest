import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import OrderSchema from '../../schemas/Order.model';
import OrderItemSchema from '../../schemas/OrderItem.model';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';

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
		]),
		AuthModule,
		MemberModule,
	],
	providers: [OrderResolver, OrderService],
})
export class OrderModule {}
