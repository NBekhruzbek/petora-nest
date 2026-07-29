import { Schema, Types } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
	{
		notificationType: {
			type: String,
			enum: NotificationType,
			required: true,
		},

		notificationStatus: {
			type: String,
			enum: NotificationStatus,
			default: NotificationStatus.UNREAD,
		},

		notificationGroup: {
			type: String,
			enum: NotificationGroup,
			required: true,
		},

		notificationTitle: {
			type: String,
			required: true,
		},

		notificationContent: {
			type: String,
		},

		/** The booking / order the notification is about, so the client can link to it. */
		notificationRefId: {
			type: Types.ObjectId,
		},

		/** Absent on PROMOTION and SYSTEM notifications, which nobody authors. */
		authorId: {
			type: Types.ObjectId,
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

// Every read is scoped to one receiver, newest first, optionally by unread.
NotificationSchema.index({ receiverId: 1, notificationStatus: 1, createdAt: -1 });

export default NotificationSchema;
