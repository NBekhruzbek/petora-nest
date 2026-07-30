import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingInput, BookingsInquiry } from '../../libs/dto/booking/booking.input';
import { BookedInfo, Bookings } from '../../libs/dto/booking/booking';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { ServiceService } from '../service/service.service';
import { ServiceStatus } from '../../libs/enums/service.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { BookingStatus } from '../../libs/enums/booking.enum';
import { T } from '../../libs/types/common';
import { BookingUpdateInput } from '../../libs/dto/booking/booking.update';
import { NotificationService } from '../notification/notification.service';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';

@Injectable()
export class BookingService {
	constructor(
		@InjectModel('Booking') private readonly bookingModel: Model<BookedInfo>,
		private readonly serviceService: ServiceService,
		private readonly notificationService: NotificationService,
	) {}

	/** MUTATIONS */

	public async createNewBooking(userId: Types.ObjectId, input: BookingInput): Promise<BookedInfo> {
		const serviceId = shapeIntoMongoObjectId(input.serviceId);
		const service = await this.serviceService.getService(null, serviceId);
		if (!service || service.serviceStatus !== ServiceStatus.ACTIVE)
			throw new InternalServerErrorException(Message.BOOKING_FAILED);

		const agentId = shapeIntoMongoObjectId(service.memberId);

		await this.checkTimeSlotAvailability(agentId, input.bookingDate, input.bookingTime);

		input.bookingPrice = service.servicePrice;
		input.agentId = agentId;
		input.userId = userId;
		input.bookingNumber = await this.createBookingNumber();

		const result = await this.bookingModel.create(input);

		await this.serviceService.updateServiceBookingTimes(result.serviceId, 1);

		await this.notificationService.createNotification({
			notificationType: NotificationType.BOOKING_CREATED,
			notificationGroup: NotificationGroup.BOOKINGS,
			notificationTitle: 'New booking request',
			notificationContent: `${service.serviceTitle} — ${this.whenLabel(result)}. Review it in Service Management.`,
			notificationRefId: result._id,
			authorId: userId,
			receiverId: agentId,
		});

		return result;
	}

	public async updateBookingByUser(userId: Types.ObjectId, input: BookingUpdateInput): Promise<BookedInfo> {
		if (input.bookingStatus !== BookingStatus.CANCELLED)
			throw new InternalServerErrorException(Message.NOT_ALLOWED_REQUEST);

		const { bookingId, ...updateData } = input;

		// The published cancellation policy lets a customer cancel up to the
		// appointment itself — not only while the agent has yet to accept. A
		// confirmed booking is exactly the case the policy is written for, so
		// PENDING alone would contradict it.
		const search = {
			userId: userId,
			_id: bookingId,
			bookingStatus: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
		};

		const result = await this.bookingModel.findOneAndUpdate(search, { $set: updateData }, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		await this.serviceService.updateServiceBookingTimes(result.serviceId, -1);

		await this.notificationService.createNotification({
			notificationType: NotificationType.BOOKING_CANCELLED,
			notificationGroup: NotificationGroup.BOOKINGS,
			notificationTitle: 'Booking cancelled',
			notificationContent: `${await this.serviceTitleOf(result.serviceId)} — ${this.whenLabel(result)} was cancelled by the customer.`,
			notificationRefId: result._id,
			authorId: userId,
			receiverId: result.agentId,
		});

		//TODO: REFOUNDING SERVICE PRICE

		return result;
	}

	public async updateBookingByAgent(agentId: Types.ObjectId, input: BookingUpdateInput): Promise<BookedInfo> {
		if (input.bookingStatus === BookingStatus.CANCELLED)
			throw new InternalServerErrorException(Message.NOT_ALLOWED_BOOKING_CANCEL);

		const { bookingId, ...updateData } = input;

		const search = {
			agentId: agentId,
			_id: bookingId,
			bookingStatus: { $ne: BookingStatus.CANCELLED },
		};

		const result = await this.bookingModel.findOneAndUpdate(search, { $set: updateData }, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (result.bookingStatus === BookingStatus.REJECTED) {
			await this.serviceService.updateServiceBookingTimes(result.serviceId, -1);
		}

		await this.notifyCustomerOfAgentDecision(agentId, result);

		//TODO: IF BOOKING STATUS is REJECTED => REFOUNDING SERVICE PAYING

		return result;
	}

	/** QUERIES */

	public async getMyBookings(userId: string, input: BookingsInquiry): Promise<Bookings> {
		const match: T = { userId: shapeIntoMongoObjectId(userId) };
		if (input.bookingStatus) match.bookingStatus = input.bookingStatus;

		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		const result = await this.bookingModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'services',
									localField: 'serviceId',
									foreignField: '_id',
									as: 'serviceData',
								},
							},
							{
								$unwind: {
									path: '$serviceData',
									preserveNullAndEmptyArrays: true,
								},
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		// If there is no data, return an empty list.
		return result[0];
	}

	public async getAgentBookings(agentId: string, input: BookingsInquiry): Promise<Bookings> {
		const match: T = { agentId: shapeIntoMongoObjectId(agentId) };
		if (input.bookingStatus) match.bookingStatus = input.bookingStatus;
		if (input.text) match.bookingNumber = { $regex: new RegExp(input.text, 'i') };

		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		const result = await this.bookingModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'services',
									localField: 'serviceId',
									foreignField: '_id',
									as: 'serviceData',
								},
							},
							{
								$unwind: {
									path: '$serviceData',
									preserveNullAndEmptyArrays: true,
								},
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		// If there is no data, return an empty list.
		return result[0];
	}

	/**
	 * Unlike getMyBookings and getAgentBookings this is scoped to nobody, so the
	 * panel can answer "what is happening on this booking" from either side. It
	 * is also the only booking query that joins the two members — support needs
	 * to see who booked and who is fulfilling without a second round trip.
	 */
	public async getAllBookingsByAdmin(input: BookingsInquiry): Promise<Bookings> {
		const match: T = {};
		if (input.bookingStatus) match.bookingStatus = input.bookingStatus;
		// Escaped: booking numbers contain hyphens, and a half-typed "BKG-(" is
		// an unterminated group rather than a search.
		if (input.text) {
			const escaped = input.text.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			match.bookingNumber = { $regex: new RegExp(escaped, 'i') };
		}

		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		const result = await this.bookingModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'services',
									localField: 'serviceId',
									foreignField: '_id',
									as: 'serviceData',
								},
							},
							{ $unwind: { path: '$serviceData', preserveNullAndEmptyArrays: true } },
							{
								$lookup: {
									from: 'members',
									localField: 'userId',
									foreignField: '_id',
									as: 'userData',
								},
							},
							{ $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
							{
								$lookup: {
									from: 'members',
									localField: 'agentId',
									foreignField: '_id',
									as: 'agentData',
								},
							},
							{ $unwind: { path: '$agentData', preserveNullAndEmptyArrays: true } },
							{
								$project: {
									'userData.memberPassword': 0,
									'userData.accessToken': 0,
									'agentData.memberPassword': 0,
									'agentData.accessToken': 0,
								},
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		// If there is no data, return an empty list.
		return result[0];
	}

	/**
	 * The admin override. Unlike the agent it may also cancel, because support
	 * acts for whichever side asked — but the side effects still have to match
	 * the customer and agent paths, so the service booking counter is decremented
	 * once on the way into CANCELLED or REJECTED and never for a booking that was
	 * already in one of them.
	 */
	public async updateBookingByAdmin(input: BookingUpdateInput): Promise<BookedInfo> {
		const { bookingId, ...updateData } = input;

		const before: BookedInfo = await this.bookingModel.findById(bookingId).lean().exec();
		if (!before) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		const result = await this.bookingModel
			.findOneAndUpdate({ _id: bookingId }, { $set: updateData }, { new: true })
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		const closed: BookingStatus[] = [BookingStatus.CANCELLED, BookingStatus.REJECTED];
		if (!closed.includes(before.bookingStatus) && closed.includes(result.bookingStatus)) {
			await this.serviceService.updateServiceBookingTimes(result.serviceId, -1);
		}

		// Nothing moved, so there is nothing anyone needs telling about.
		if (before.bookingStatus === result.bookingStatus) return result;

		if (result.bookingStatus === BookingStatus.CANCELLED) {
			// Neither party did this, so both of them hear about it.
			for (const receiverId of [result.userId, result.agentId]) {
				await this.notificationService.createNotification({
					notificationType: NotificationType.BOOKING_CANCELLED,
					notificationGroup: NotificationGroup.BOOKINGS,
					notificationTitle: 'Booking cancelled',
					notificationContent: `${await this.serviceTitleOf(result.serviceId)} — ${this.whenLabel(
						result,
					)} was cancelled by Petora support.`,
					notificationRefId: result._id,
					receiverId: receiverId,
				});
			}
			return result;
		}

		await this.notifyCustomerOfAgentDecision(result.agentId, result);

		return result;
	}

	/** HELPERS **/

	/**
	 * A completed service asks for a review; the other transitions just report
	 * the agent's decision. PENDING is skipped — it is the state the booking was
	 * already in when the customer created it.
	 */
	private async notifyCustomerOfAgentDecision(agentId: Types.ObjectId, booking: BookedInfo): Promise<void> {
		const copy: Partial<Record<BookingStatus, { type: NotificationType; title: string; body: string }>> = {
			[BookingStatus.CONFIRMED]: {
				type: NotificationType.BOOKING_CONFIRMED,
				title: 'Booking confirmed',
				body: 'is confirmed. See you then!',
			},
			[BookingStatus.REJECTED]: {
				type: NotificationType.BOOKING_REJECTED,
				title: 'Booking declined',
				body: 'was declined by the agent.',
			},
			[BookingStatus.COMPLETED]: {
				type: NotificationType.REVIEW_REQUESTED,
				title: 'How did it go?',
				body: 'is complete. Leave a review to help other pet owners.',
			},
		};

		const entry = copy[booking.bookingStatus];
		if (!entry) return;

		await this.notificationService.createNotification({
			notificationType: entry.type,
			notificationGroup: NotificationGroup.BOOKINGS,
			notificationTitle: entry.title,
			notificationContent: `${await this.serviceTitleOf(booking.serviceId)} — ${this.whenLabel(booking)} ${entry.body}`,
			notificationRefId: booking._id,
			authorId: agentId,
			receiverId: booking.userId,
		});
	}

	private whenLabel(booking: BookedInfo): string {
		return [booking.bookingDate, booking.bookingTime].filter(Boolean).join(' at ');
	}

	/**
	 * Best effort: the title is only used for notification copy, and getService
	 * throws for services that have since been removed. Never let that break the
	 * booking update that triggered it.
	 */
	private async serviceTitleOf(serviceId: Types.ObjectId): Promise<string> {
		try {
			const service = await this.serviceService.getService(null, shapeIntoMongoObjectId(serviceId));
			return service?.serviceTitle ?? 'Your booking';
		} catch {
			return 'Your booking';
		}
	}

	private async checkTimeSlotAvailability(
		agentId: Types.ObjectId,
		bookingDate: string,
		bookingTime: string,
	): Promise<void> {
		const existingBooking = await this.bookingModel.findOne({
			agentId,
			bookingDate,
			bookingTime,
			bookingStatus: { $nin: [BookingStatus.CANCELLED, BookingStatus.REJECTED] },
		});
		if (existingBooking) throw new InternalServerErrorException(Message.BOOKING_TIME_NOT_AVAILABLE);
	}

	private async createBookingNumber(): Promise<string> {
		return await `BOOKING-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
	}
}
