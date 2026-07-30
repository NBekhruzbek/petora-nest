import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';
import MemberSchema from '../../schemas/Member.model';
import ProductSchema from '../../schemas/Product.model';
import OrderSchema from '../../schemas/Order.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Member',
				schema: MemberSchema,
			},
			{
				name: 'Product',
				schema: ProductSchema,
			},
			{
				name: 'Order',
				schema: OrderSchema,
			},
		]),
		AuthModule,
	],
	providers: [AdminResolver, AdminService],
})
export class AdminModule {}
