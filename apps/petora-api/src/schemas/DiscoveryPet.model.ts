import { Schema, Types } from 'mongoose';
import { PetCategory, PetStatus } from '../libs/enums/discoveryPet.enum';

const DiscoveryPetSchema = new Schema(
	{
		petCategory: {
			type: String,
			enum: PetCategory,
			required: true,
		},

		petStatus: {
			type: String,
			enum: PetStatus,
			default: PetStatus.ACTIVE,
		},

		petName: {
			type: String,
			required: true,
		},

		petCountry: {
			type: String,
			required: true,
		},

		petImage: {
			type: String,
			required: true,
		},

		petDifficulty: {
			type: Number,
			required: true,
		},

		petFerocious: {
			type: Number,
			required: true,
		},

		petSpace: {
			type: Number,
			required: true,
		},

		petGroups: {
			type: Number,
			required: true,
		},

		petDescription: {
			type: String,
			required: true,
		},

		petLink: {
			type: String,
		},

		petLikes: {
			type: Number,
			default: 0,
		},

		petViews: {
			type: Number,
			default: 0,
		},

		petRank: {
			type: Number,
			default: 0,
		},

		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'discoveryPets' },
);

export default DiscoveryPetSchema;
