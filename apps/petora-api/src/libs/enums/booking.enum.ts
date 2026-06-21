import { registerEnumType } from '@nestjs/graphql';

export enum BookingStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
	REJECTED = 'REJECTED',
}
registerEnumType(BookingStatus, { name: 'BookingStatus' });

export enum BookingPaymentStatus {
	UNPAID = 'UNPAID',
	PAID = 'PAID',
	REFUNDED = 'REFUNDED',
}
registerEnumType(BookingPaymentStatus, { name: 'BookingPaymentStatus' });

export enum BookingPetType {
	DOG = 'DOG',
	CAT = 'CAT',
	RABBIT = 'RABBIT',
	BIRD = 'BIRD',
	HAMSTER = 'HAMSTER',
	OTHER = 'OTHER',
}
registerEnumType(BookingPetType, { name: 'BookingPetType' });
