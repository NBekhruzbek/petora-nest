import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { BookingInput, BookingsInquiry } from '../../libs/dto/booking/booking.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { BookedInfo, Bookings } from '../../libs/dto/booking/booking';
import { BookingUpdateInput } from '../../libs/dto/booking/booking.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class BookingResolver {
	constructor(private readonly bookingService: BookingService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => BookedInfo)
	public async createNewBooking(
		@Args('input') input: BookingInput,
		@AuthMember('_id') _id: String,
	): Promise<BookedInfo> {
		console.log('Mutation: createNewBooking');
		const userId = shapeIntoMongoObjectId(_id);
		return await this.bookingService.createNewBooking(userId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => BookedInfo)
	public async updateBookingByUser(
		@Args('input') input: BookingUpdateInput,
		@AuthMember('_id') _id: String,
	): Promise<BookedInfo> {
		console.log('Mutation: updateBookingByUser');
		const userId = shapeIntoMongoObjectId(_id);
		return await this.bookingService.updateBookingByUser(userId, input);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => BookedInfo)
	public async updateBookingByAgent(
		@Args('input') input: BookingUpdateInput,
		@AuthMember('_id') _id: String,
	): Promise<BookedInfo> {
		console.log('Mutation: updateBookingByAgent');
		const agentId = shapeIntoMongoObjectId(_id);
		return await this.bookingService.updateBookingByAgent(agentId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Bookings)
	public async getMyBookings(
		@Args('input') input: BookingsInquiry,
		@AuthMember('_id') userId: string,
	): Promise<Bookings> {
		console.log('Query: getMyBookings');
		return await this.bookingService.getMyBookings(userId, input);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => Bookings)
	public async getAgentBookings(
		@Args('input') input: BookingsInquiry,
		@AuthMember('_id') agentId: string,
	): Promise<Bookings> {
		console.log('Query: getAgentBookings');
		return await this.bookingService.getAgentBookings(agentId, input);
	}
}
