import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import OrderSchema from '../../schemas/Order.model';
import OrderItemSchema from '../../schemas/OrderItem.model';

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
		]),
	],
	providers: [OrderResolver, OrderService],
})
export class OrderModule {}
