import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { BookingInput } from '../../libs/dto/booking/booking.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { BookedInfo } from '../../libs/dto/booking/booking';

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
}
