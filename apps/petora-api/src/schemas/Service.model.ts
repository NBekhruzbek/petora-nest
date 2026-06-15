import { Schema, Types } from 'mongoose';
import { ServiceLocation, ServiceStatus, ServiceType } from '../libs/enums/service.enum';

const ServiceSchema = new Schema(
	{
		serviceType: {
			type: String,
			enum: ServiceType,
			required: true,
		},

		serviceStatus: {
			type: String,
			enum: ServiceStatus,
			default: ServiceStatus.PAUSE,
		},

		serviceLocation: {
			type: String,
			enum: ServiceLocation,
			required: true,
		},

		servicePrice: {
			type: Number,
			required: true,
		},

		serviceImages: {
			type: [String],
			default: [],
		},

		serviceDurationMinutes: {
			type: Number,
			required: true,
		},

		serviceDescription: {
			type: String,
			required: true,
		},

		serviceBookings: {
			type: Number,
			default: 0,
		},

		serviceLikes: {
			type: Number,
			default: 0,
		},
		serviceViews: {
			type: Number,
			default: 0,
		},
		serviceReviews: {
			type: Number,
			default: 0,
		},
		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'members',
		},
	},
	{ timestamps: true, collection: 'services' },
);

export default ServiceSchema;
