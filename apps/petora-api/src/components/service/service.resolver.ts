import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ServiceService } from './service.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ServiceInput, ServiceOrdinaryInquiry, ServicesInquiry } from '../../libs/dto/service/service.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Types } from 'mongoose';
import { Service, Services } from '../../libs/dto/service/service';
import { ServiceUpdate } from '../../libs/dto/service/service.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthGuard } from '../auth/guards/auth.guard';

@Resolver()
export class ServiceResolver {
	constructor(private readonly serviceService: ServiceService) {}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Service)
	public async createService(
		@Args('input') input: ServiceInput,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<Service> {
		console.log('Mutation: createService');
		return await this.serviceService.createService(memberId, input);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Service)
	public async updateService(
		@Args('input') input: ServiceUpdate,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<Service> {
		console.log('Mutation: updateService');
		return await this.serviceService.updateService(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Service)
	public async updateServiceByAdmin(@Args('input') input: ServiceUpdate): Promise<Service> {
		console.log('Mutation: updateServiceByAdmin');
		return await this.serviceService.updateServiceByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Service)
	public async removeServiceByAdmin(@Args('serviceId') input: string): Promise<Service> {
		console.log('Mutation: removeServiceByAdmin');
		const serviceId = shapeIntoMongoObjectId(input);
		return await this.serviceService.removeServiceByAdmin(serviceId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Service)
	public async getService(@Args('serviceId') input: string, @AuthMember('_id') memberId: string): Promise<Service> {
		console.log('Query: getService');
		const targetId = shapeIntoMongoObjectId(input);
		const viewerId = shapeIntoMongoObjectId(memberId);
		return await this.serviceService.getService(viewerId, targetId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Services)
	public async getFavoriteServices(
		@Args('input') input: ServiceOrdinaryInquiry,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<Services> {
		console.log('Query: getFavoriteServices');
		return await this.serviceService.getFavoriteServices(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Services)
	public async getAllServices(
		@Args('input') input: ServicesInquiry,
		@AuthMember('_id') _id: string,
	): Promise<Services> {
		console.log('Query: getAllServices');
		return await this.serviceService.getAllServices(_id, input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => [Service])
	public async getRelatedServices(
		@Args('serviceId') input: string,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<Service[]> {
		console.log('Query: getRelatedServices');
		return await this.serviceService.getRelatedServices(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Service)
	public async likeTargetService(
		@Args('serviceId') input: string,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<Service> {
		console.log('Mutation: likeTargetService');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.serviceService.likeTargetService(memberId, likeRefId);
	}
}
