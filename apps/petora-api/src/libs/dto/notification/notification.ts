import { Field, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Notification {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => NotificationType)
	notificationType: NotificationType;

	@Field(() => NotificationStatus)
	notificationStatus: NotificationStatus;

	@Field(() => NotificationGroup)
	notificationGroup: NotificationGroup;

	@Field(() => String)
	notificationTitle: string;

	@Field(() => String, { nullable: true })
	notificationContent?: string;

	/** Booking or order id, depending on notificationGroup. */
	@Field(() => String, { nullable: true })
	notificationRefId?: Types.ObjectId;

	@Field(() => String, { nullable: true })
	authorId?: Types.ObjectId;

	@Field(() => String)
	receiverId: Types.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class Notifications {
	@Field(() => [Notification])
	list: Notification[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];

	/** Unread across the whole matched set, not just the requested page. */
	@Field(() => [TotalCounter], { nullable: true })
	unreadCounter?: TotalCounter[];
}
