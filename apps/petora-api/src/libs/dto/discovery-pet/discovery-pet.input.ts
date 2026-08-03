import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PetCategory, PetStatus } from '../../enums/discoveryPet.enum';
import { Types } from 'mongoose';
import { availableDiscoveryPetSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class DiscoveryPetInput {
	@IsNotEmpty()
	@Field(() => PetCategory)
	petCategory: PetCategory;

	@IsOptional()
	@Field(() => PetStatus, { nullable: true })
	petStatus?: PetStatus;

	@IsNotEmpty()
	@Field(() => String)
	petName: string;

	@IsNotEmpty()
	@Field(() => String)
	petCountry: string;

	@IsNotEmpty()
	@Field(() => String)
	petImage: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@Max(100)
	@Field(() => Number)
	petDifficulty: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@Max(100)
	@Field(() => Number)
	petFerocious: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@Max(100)
	@Field(() => Number)
	petSpace: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@Max(100)
	@Field(() => Number)
	petGroups: number;

	@IsNotEmpty()
	@Field(() => String)
	petDescription: string;

	// "Read More" destination the admin picks for this pet.
	@IsNotEmpty()
	@Field(() => String)
	petLink: string;

	memberId?: Types.ObjectId;
}

@InputType()
class DPISearch {
	@IsOptional()
	@Field(() => [PetCategory], { nullable: true })
	petCategory?: PetCategory[];

	@IsOptional()
	@Field(() => [PetStatus], { nullable: true })
	petStatus?: PetStatus[];

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	onlyLiked?: boolean;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class DiscoveryPetsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableDiscoveryPetSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => DPISearch)
	search: DPISearch;
}
