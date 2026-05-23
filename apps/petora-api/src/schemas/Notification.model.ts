import { Schema, Types, model } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../libs/enums/notificationi.enum';

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
			ref: 'members',
		},

		receiverId: {
			type: Types.ObjectId,
			required: true,
			ref: 'members',
		},
	},
	{ timestamps: true, collection: 'notifications' },
);

export default NotificationSchema;
