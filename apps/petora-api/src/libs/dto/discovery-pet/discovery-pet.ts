import { Types } from 'mongoose';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PetCategory, PetStatus } from '../../enums/discoveryPet.enum';
import { MeLiked } from '../like/like';

@ObjectType()
export class DiscoveryPet {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => PetCategory)
	petCategory: PetCategory;

	@Field(() => PetStatus)
	petStatus: PetStatus;

	@Field(() => String)
	petName: string;

	@Field(() => String)
	petCountry: string;

	@Field(() => String)
	petImage: string;

	@Field(() => Number)
	petDifficulty: number;

	@Field(() => Number)
	petFerocious: number;

	@Field(() => Number)
	petSpace: number;

	@Field(() => Number)
	petGroups: number;

	@Field(() => String)
	petDescription: string;

	// Nullable so legacy/seeded pets without one don't break existing queries.
	@Field(() => String, { nullable: true })
	petLink?: string;

	@Field(() => Number)
	petLikes: number;

	@Field(() => Number)
	petViews: number;

	@Field(() => Number)
	petRank: number;

	@Field(() => String)
	memberId: Types.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation */

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}

@ObjectType()
export class DiscoveryPetTotalCounter {
	@Field(() => Int, { nullable: true })
	total: number;
}

@ObjectType()
export class DiscoveryPets {
	@Field(() => [DiscoveryPet])
	list: DiscoveryPet[];

	@Field(() => [DiscoveryPetTotalCounter], { nullable: true })
	metaCounter: DiscoveryPetTotalCounter[];
}
