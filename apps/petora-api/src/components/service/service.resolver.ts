import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ServiceService } from './service.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ServiceInput } from '../../libs/dto/service/service.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Types } from 'mongoose';
import { Service } from '../../libs/dto/service/service';
import { ServiceUpdate } from '../../libs/dto/service/service.update';

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
}
