import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';
import NotificationSchema from '../../schemas/Notification.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Notification',
				schema: NotificationSchema,
			},
		]),
		AuthModule,
	],
	providers: [NotificationResolver, NotificationService],
	// Booking and order emit notifications, so they need the service.
	exports: [NotificationService],
})
export class NotificationModule {}
