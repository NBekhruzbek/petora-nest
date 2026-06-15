import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ServiceLocation, ServiceStatus, ServiceType } from '../../enums/service.enum';
import { Types } from 'mongoose';

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
