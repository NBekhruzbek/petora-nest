import { Types } from 'mongoose';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ServiceLocation, ServiceStatus, ServiceType } from '../../enums/service.enum';

@ObjectType()
export class Service {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => ServiceType)
	serviceType: ServiceType;

	@Field(() => String)
	serviceTitle: string;

	@Field(() => ServiceStatus)
	serviceStatus: ServiceStatus;

	@Field(() => ServiceLocation)
	serviceLocation: ServiceLocation;

	@Field(() => Number)
	servicePrice: number;

	@Field(() => [String])
	serviceImages: string[];

	@Field(() => Number)
	serviceDurationMinutes: number;

	@Field(() => String)
	serviceDescription: string;

	@Field(() => Number)
	serviceBookings: number;

	@Field(() => Number)
	serviceLikes: number;

	@Field(() => Number)
	serviceViews: number;

	@Field(() => Number)
	serviceReviews: number;

	@Field(() => String)
	memberId: Types.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class ServiceTotalCounter {
	@Field(() => Int, { nullable: true })
	total: number;
}

@ObjectType()
export class Services {
	@Field(() => [Service])
	list: Service[];

	@Field(() => [ServiceTotalCounter], { nullable: true })
	metaCounter: ServiceTotalCounter[];
}
