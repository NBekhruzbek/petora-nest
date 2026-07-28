import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ServiceLocation, ServiceStatus, ServiceType } from '../../enums/service.enum';
import { Types } from 'mongoose';
import { availableServiceSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class ServiceInput {
	@IsNotEmpty()
	@Field(() => ServiceType)
	serviceType: ServiceType;

	@IsNotEmpty()
	@Field(() => String)
	serviceTitle: string;

	@IsOptional()
	@Field(() => ServiceStatus, { nullable: true })
	serviceStatus?: ServiceStatus;

	@IsNotEmpty()
	@Field(() => ServiceLocation)
	serviceLocation: ServiceLocation;

	@IsNotEmpty()
	@IsNumber()
	@Field(() => Number)
	servicePrice: number;

	@IsNotEmpty()
	@Field(() => [String])
	serviceImages: string[];

	@IsNotEmpty()
	@IsNumber()
	@Field(() => Number)
	serviceDurationMinutes: number;

	@IsNotEmpty()
	@Field(() => String)
	serviceDescription: string;

	memberId?: Types.ObjectId;
}

@InputType()
class ServicePriceRange {
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Field(() => Number, { nullable: true })
	min?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(5000000)
	@Field(() => Number, { nullable: true })
	max?: number;
}

@InputType()
class SISearch {
	@IsOptional()
	@Field(() => ServicePriceRange, { nullable: true })
	priceRange?: ServicePriceRange;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	onlyLiked: boolean;

	@IsOptional()
	@Field(() => [ServiceType], { nullable: true })
	serviceType?: ServiceType[];

	@IsOptional()
	@Field(() => [ServiceStatus], { nullable: true })
	serviceStatus?: ServiceStatus[];

	@IsOptional()
	@Field(() => [ServiceLocation], { nullable: true })
	serviceLocation?: ServiceLocation[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;

	// Lets an agent pull their own catalogue in MyPage; combined with
	// serviceStatus it also exposes the offers that are paused or removed.
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: Types.ObjectId;
}

@InputType()
export class ServicesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableServiceSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => SISearch)
	search: SISearch;
}

@InputType()
export class ServiceOrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;
}
