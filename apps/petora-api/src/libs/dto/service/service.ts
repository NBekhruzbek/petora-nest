import { Types } from 'mongoose';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ProductPetType, ProductStatus, ProductType } from '../../enums/product.enum';
import { ServiceLocation, ServiceStatus, ServiceType } from '../../enums/service.enum';

@ObjectType()
export class Service {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => ServiceType)
	serviceType: ServiceType;

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
