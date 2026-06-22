import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingInput } from '../../libs/dto/booking/booking.input';
import { BookedInfo } from '../../libs/dto/booking/booking';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { ServiceService } from '../service/service.service';
import { ServiceStatus } from '../../libs/enums/service.enum';
import { Message } from '../../libs/enums/common.enum';
import { BookingStatus } from '../../libs/enums/booking.enum';

@Injectable()
export class BookingService {
	constructor(
		@InjectModel('Booking') private readonly bookingModel: Model<BookedInfo>,
		private readonly serviceService: ServiceService,
	) {}

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
		return `BOOKING-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
	}
}
