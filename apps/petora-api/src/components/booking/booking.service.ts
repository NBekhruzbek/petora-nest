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

@Injectable()
export class BookingService {
	constructor(
		@InjectModel('Booking') private readonly bookingModel: Model<BookedInfo>,
		private readonly serviceService: ServiceService,
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

		return result;
	}

	public async updateBookingByUser(userId: Types.ObjectId, input: BookingUpdateInput): Promise<BookedInfo> {
		if (input.bookingStatus !== BookingStatus.CANCELLED)
			throw new InternalServerErrorException(Message.NOT_ALLOWED_REQUEST);

		const { bookingId, ...updateData } = input;

		const search = {
			userId: userId,
			_id: bookingId,
			bookingStatus: BookingStatus.PENDING,
		};

		const result = await this.bookingModel.findOneAndUpdate(search, { $set: updateData }, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		await this.serviceService.updateServiceBookingTimes(result.serviceId, -1);

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

	/** HELPERS **/

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
