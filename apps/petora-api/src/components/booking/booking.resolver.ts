import { Resolver } from '@nestjs/graphql';
import { BookingService } from './booking.service';

@Resolver()
export class BookingResolver {
	constructor(private readonly bookingService: BookingService) {}
}
