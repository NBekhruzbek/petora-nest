import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import { NotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { NotificationUpdate } from '../../libs/dto/notification/notification.update';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { T } from '../../libs/types/common';
import { SocketModule } from '../../socket/socket.module';
import { SocketGateway } from '../../socket/socket.gateway';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification') private readonly notificationModel: Model<Notification>,
		private readonly socketGateway: SocketGateway,
	) {}

	/** EMISSION **/

	/**
	 * Called by the services that own the underlying event (booking, order),
	 * never by a resolver.
	 *
	 * A notification is a side effect: if writing it fails, the booking or order
	 * that triggered it must still succeed. So this swallows its own errors and
	 * reports success as a boolean instead of throwing into the caller.
	 */
	public async createNotification(input: NotificationInput): Promise<boolean> {
		// Nobody should be notified about their own action.
		if (input.authorId && String(input.authorId) === String(input.receiverId)) return false;

		try {
			const created = await this.notificationModel.create(input);
			this.socketGateway.sendNotification(input.receiverId, created);
			return true;
		} catch (err) {
			console.log('Error, Notification.model:', err instanceof Error ? err.message : err);
			return false;
		}
	}

	/** QUERIES **/

	public async getNotifications(receiverId: Types.ObjectId, input: NotificationsInquiry): Promise<Notifications> {
		const match: T = { receiverId: receiverId };
		if (input.search?.notificationGroup) match.notificationGroup = input.search.notificationGroup;
		if (input.search?.notificationStatus) match.notificationStatus = input.search.notificationStatus;

		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		const result = await this.notificationModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
						// Facet branches see the whole matched set, so this counts unread
						// across every page — which is what the tab badge needs.
						unreadCounter: [{ $match: { notificationStatus: NotificationStatus.UNREAD } }, { $count: 'total' }],
					},
				},
			])
			.exec();

		// An empty inbox is a normal state, not an error — unlike the older list
		// queries here, this returns an empty list rather than throwing.
		return result[0] ?? { list: [], metaCounter: [], unreadCounter: [] };
	}

	public async getUnreadNotificationsCount(receiverId: Types.ObjectId): Promise<number> {
		return await this.notificationModel
			.countDocuments({ receiverId: receiverId, notificationStatus: NotificationStatus.UNREAD })
			.exec();
	}

	/** MUTATIONS **/

	public async updateNotification(receiverId: Types.ObjectId, input: NotificationUpdate): Promise<Notification> {
		const notificationId = shapeIntoMongoObjectId(input.notificationId);

		// receiverId in the filter keeps a member from touching someone else's inbox.
		const result: Notification = await this.notificationModel
			.findOneAndUpdate(
				{ _id: notificationId, receiverId: receiverId },
				{ $set: { notificationStatus: input.notificationStatus } },
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async markAllNotificationsRead(receiverId: Types.ObjectId): Promise<number> {
		const result = await this.notificationModel
			.updateMany(
				{ receiverId: receiverId, notificationStatus: NotificationStatus.UNREAD },
				{ $set: { notificationStatus: NotificationStatus.READ } },
			)
			.exec();

		return result.modifiedCount;
	}
}
