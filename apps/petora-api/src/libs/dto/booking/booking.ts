import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { BookingPaymentStatus, BookingPetType, BookingStatus } from '../../enums/booking.enum';

@ObjectType()
export class BookedInfo {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => String)
	bookingNumber: string;

	@Field(() => BookingStatus)
	bookingStatus: BookingStatus;

	@Field(() => BookingPaymentStatus)
	bookingPaymentStatus: BookingPaymentStatus;

	@Field(() => String)
	bookingDate: string;

	@Field(() => String)
	bookingTime: string;

	@Field(() => Number)
	bookingPrice: number;

	@Field(() => BookingPetType)
	bookingPetType: BookingPetType;

	@Field(() => String)
	bookingPetName: string;

	@Field(() => String, { nullable: true })
	bookingPetAge?: string;

	@Field(() => String, { nullable: true })
	bookingNote?: string;

	@Field(() => String, { nullable: true })
	bookingAddress?: string;

	@Field(() => String)
	serviceId: Types.ObjectId;

	@Field(() => String)
	userId: Types.ObjectId;

	@Field(() => String)
	agentId: Types.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
