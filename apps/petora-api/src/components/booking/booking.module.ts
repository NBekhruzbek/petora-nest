import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import OrderItemSchema from '../../schemas/OrderItem.model';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Booking',
				schema: OrderItemSchema,
			},
		]),
		AuthModule,
	],
	providers: [BookingService, BookingResolver],
})
export class BookingModule {}
