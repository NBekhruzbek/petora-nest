import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ServiceModule } from '../service/service.module';
import BookingSchema from '../../schemas/Booking.model';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Booking',
				schema: BookingSchema,
			},
		]),
		AuthModule,
		ServiceModule,
		NotificationModule,
	],
	providers: [BookingService, BookingResolver],
})
export class BookingModule {}
