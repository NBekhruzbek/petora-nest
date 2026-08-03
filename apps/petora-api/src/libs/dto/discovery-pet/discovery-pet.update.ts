import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Types } from 'mongoose';
import { PetCategory, PetStatus } from '../../enums/discoveryPet.enum';

@InputType()
export class DiscoveryPetUpdate {
	@IsNotEmpty()
	@Field(() => String)
	petId: Types.ObjectId;

	@IsOptional()
	@Field(() => PetCategory, { nullable: true })
	petCategory?: PetCategory;

	@IsOptional()
	@Field(() => PetStatus, { nullable: true })
	petStatus?: PetStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	petName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	petCountry?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	petImage?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	@Field(() => Number, { nullable: true })
	petDifficulty?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	@Field(() => Number, { nullable: true })
	petFerocious?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	@Field(() => Number, { nullable: true })
	petSpace?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	@Field(() => Number, { nullable: true })
	petGroups?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	petDescription?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	petLink?: string;
}
