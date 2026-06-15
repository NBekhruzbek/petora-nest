import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { ServiceLocation, ServiceStatus, ServiceType } from '../../enums/service.enum';

@InputType()
export class ServiceUpdate {
	@IsNotEmpty()
	@Field(() => String)
	serviceId: Types.ObjectId;

	@IsOptional()
	@Field(() => ServiceType, { nullable: true })
	serviceType?: ServiceType;

	@IsOptional()
	@Field(() => String, { nullable: true })
	serviceTitle?: string;

	@IsOptional()
	@Field(() => ServiceStatus, { nullable: true })
	serviceStatus?: ServiceStatus;

	@IsOptional()
	@Field(() => ServiceLocation, { nullable: true })
	serviceLocation?: ServiceLocation;

	@IsOptional()
	@IsNumber()
	@Field(() => Number, { nullable: true })
	servicePrice?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	serviceImages?: string[];

	@IsOptional()
	@IsNumber()
	@Field(() => Number, { nullable: true })
	serviceDurationMinutes?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	serviceDescription?: string;

	deletedAt?: Date;
}
