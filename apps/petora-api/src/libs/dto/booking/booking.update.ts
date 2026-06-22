import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { BookingStatus } from '../../enums/booking.enum';

@InputType()
export class BookingUpdateInput {
	@IsNotEmpty()
	@Field(() => String)
	bookingId: Types.ObjectId;

	@IsNotEmpty()
	@Field(() => BookingStatus)
	bookingStatus: BookingStatus;
}
