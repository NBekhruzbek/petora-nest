import { Types } from 'mongoose';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { BookingPetType } from '../../enums/booking.enum';

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
