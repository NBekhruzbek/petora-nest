import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Types } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Direction } from '../../enums/common.enum';
import { availableNotificationSorts } from '../../config';

/**
 * Server-side only: notifications are emitted as a side effect of bookings and
 * orders, never created through a mutation, so this is not an @InputType.
 */
export interface NotificationInput {
	notificationType: NotificationType;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationContent?: string;
	notificationRefId?: Types.ObjectId;
	authorId?: Types.ObjectId;
	receiverId: Types.ObjectId;
}

@InputType()
class NISearch {
	@IsOptional()
	@Field(() => NotificationGroup, { nullable: true })
	notificationGroup?: NotificationGroup;

	@IsOptional()
	@Field(() => NotificationStatus, { nullable: true })
	notificationStatus?: NotificationStatus;
}

@InputType()
export class NotificationsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableNotificationSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsOptional()
	@Field(() => NISearch, { nullable: true })
	search?: NISearch;
}
