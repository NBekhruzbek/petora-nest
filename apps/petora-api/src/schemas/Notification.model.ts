import { Schema, Types } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
	{
		notificationType: {
			type: String,
			enum: NotificationType,
		},

		notificationStatus: {
			type: String,
			enum: NotificationStatus,
			default: NotificationStatus.UNREAD,
		},

		notificationGroup: {
			type: String,
			enum: NotificationGroup,
		},

		notificationTitle: {
			type: String,
		},

		notificationContent: {
			type: String,
		},

		authorId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		receiverId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'notifications' },
);

export default NotificationSchema;
