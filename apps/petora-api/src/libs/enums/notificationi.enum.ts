import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
	BOOKING_CREATED = 'BOOKING_CREATED',
	BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
	BOOKING_CANCELLED = 'BOOKING_CANCELLED',

	ORDER_CREATED = 'ORDER_CREATED',
	ORDER_PAID = 'ORDER_PAID',
	ORDER_SHIPPED = 'ORDER_SHIPPED',
	ORDER_DELIVERED = 'ORDER_DELIVERED',
	ORDER_CANCELLED = 'ORDER_CANCELLED',

	MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',

	REVIEW_REQUESTED = 'REVIEW_REQUESTED',
	PROMOTION = 'PROMOTION',
	SYSTEM = 'SYSTEM',
}
registerEnumType(NotificationType, { name: 'NotificationType' });

export enum NotificationStatus {
	UNREAD = 'UNREAD',
	READ = 'READ',
}
registerEnumType(NotificationStatus, { name: 'NotificationStatus' });

export enum NotificationGroup {
	ORDERS = 'ORDERS',
	BOOKINGS = 'BOOKINGS',
	SYSTEM = 'SYSTEM',
}
registerEnumType(NotificationGroup, { name: 'NotificationGroup' });
