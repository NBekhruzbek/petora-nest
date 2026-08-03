import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DiscoveryPetService } from './discovery-pet.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DiscoveryPetInput, DiscoveryPetsInquiry } from '../../libs/dto/discovery-pet/discovery-pet.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Types } from 'mongoose';
import { DiscoveryPet, DiscoveryPets } from '../../libs/dto/discovery-pet/discovery-pet';
import { DiscoveryPetUpdate } from '../../libs/dto/discovery-pet/discovery-pet.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthGuard } from '../auth/guards/auth.guard';

@Resolver()
export class DiscoveryPetResolver {
	constructor(private readonly discoveryPetService: DiscoveryPetService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => DiscoveryPet)
	public async createDiscoveryPet(
		@Args('input') input: DiscoveryPetInput,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<DiscoveryPet> {
		console.log('Mutation: createDiscoveryPet');
		return await this.discoveryPetService.createDiscoveryPet(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => DiscoveryPet)
	public async updateDiscoveryPetByAdmin(@Args('input') input: DiscoveryPetUpdate): Promise<DiscoveryPet> {
		console.log('Mutation: updateDiscoveryPetByAdmin');
		return await this.discoveryPetService.updateDiscoveryPetByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => DiscoveryPet)
	public async removeDiscoveryPetByAdmin(@Args('petId') input: string): Promise<DiscoveryPet> {
		console.log('Mutation: removeDiscoveryPetByAdmin');
		const petId = shapeIntoMongoObjectId(input);
		return await this.discoveryPetService.removeDiscoveryPetByAdmin(petId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => DiscoveryPet)
	public async getDiscoveryPet(@Args('petId') input: string, @AuthMember('_id') memberId: string): Promise<DiscoveryPet> {
		console.log('Query: getDiscoveryPet');
		const targetId = shapeIntoMongoObjectId(input);
		const viewerId = shapeIntoMongoObjectId(memberId);
		return await this.discoveryPetService.getDiscoveryPet(viewerId, targetId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => DiscoveryPets)
	public async getAllDiscoveryPets(
		@Args('input') input: DiscoveryPetsInquiry,
		@AuthMember('_id') _id: string,
	): Promise<DiscoveryPets> {
		console.log('Query: getAllDiscoveryPets');
		return await this.discoveryPetService.getAllDiscoveryPets(_id, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => DiscoveryPet)
	public async likeTargetDiscoveryPet(
		@Args('petId') input: string,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<DiscoveryPet> {
		console.log('Mutation: likeTargetDiscoveryPet');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.discoveryPetService.likeTargetDiscoveryPet(memberId, likeRefId);
	}
}
