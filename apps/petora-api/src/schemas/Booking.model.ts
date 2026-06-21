import { Schema, Types } from 'mongoose';
import { BookingPaymentStatus, BookingPetType, BookingStatus } from '../libs/enums/booking.enum';

const BookingSchema = new Schema(
	{
		bookingNumber: {
			type: String,
			required: true,
		},

		bookingStatus: {
			type: String,
			enum: BookingStatus,
			default: BookingStatus.PENDING,
		},

		bookingPaymentStatus: {
			type: String,
			enum: BookingPaymentStatus,
			default: BookingPaymentStatus.UNPAID,
		},

		bookingDate: {
			type: String,
			required: true,
		},

		bookingTime: {
			type: String,
			required: true,
		},

		bookingPrice: {
			type: Number,
			required: true,
		},

		bookingPetType: {
			type: String,
			enum: BookingPetType,
			required: true,
		},

		bookingPetName: {
			type: String,
			required: true,
		},

		bookingPetAge: {
			type: String,
		},

		bookingNote: {
			type: String,
		},

		bookingAddress: {
			type: String,
		},

		serviceId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Service',
		},

		userId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		agentId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'bookings' },
);

BookingSchema.index(
	{ agentId: 1, bookingDate: 1, bookingTime: 1 },
	{
		unique: true,
		partialFilterExpression: {
			bookingStatus: { $nin: [BookingStatus.CANCELLED, BookingStatus.REJECTED] },
		},
	},
);

export default BookingSchema;
