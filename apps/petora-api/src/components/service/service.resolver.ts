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
		return await this.serviceService.createService(memberId, input);
	}
}
