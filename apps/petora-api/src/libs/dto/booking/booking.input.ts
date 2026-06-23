import { Types } from 'mongoose';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { BookingPetType, BookingStatus } from '../../enums/booking.enum';
import { Direction } from '../../enums/common.enum';
import { availableBookingSorts } from '../../config';

@InputType()
export class BookingInput {
	bookingNumber: string;

	@IsNotEmpty()
	@Field(() => String)
	bookingDate: string;

	@IsNotEmpty()
	@Field(() => String)
	bookingTime: string;

	bookingPrice: number;

	@IsNotEmpty()
	@Field(() => BookingPetType)
	bookingPetType: BookingPetType;

	@IsNotEmpty()
	@Field(() => String)
	bookingPetName: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	bookingPetAge?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	bookingNote?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	bookingAddress?: string;

	@IsNotEmpty()
	@Field(() => String)
	serviceId: Types.ObjectId;

	userId?: Types.ObjectId;

	agentId: Types.ObjectId;
}

@InputType()
export class BookingsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableBookingSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsOptional()
	@Field(() => BookingStatus, { nullable: true })
	bookingStatus?: BookingStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}
