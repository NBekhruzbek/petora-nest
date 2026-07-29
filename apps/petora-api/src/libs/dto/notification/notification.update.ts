import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { NotificationStatus } from '../../enums/notification.enum';

@InputType()
export class NotificationUpdate {
	@IsNotEmpty()
	@Field(() => String)
	notificationId: Types.ObjectId;

	@IsNotEmpty()
	@Field(() => NotificationStatus)
	notificationStatus: NotificationStatus;
}
