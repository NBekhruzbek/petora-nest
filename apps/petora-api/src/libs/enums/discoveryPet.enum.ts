import { registerEnumType } from '@nestjs/graphql';

export enum PetCategory {
	DOG = 'DOG',
	CAT = 'CAT',
	RABBIT = 'RABBIT',
	BIRD = 'BIRD',
	HAMSTER = 'HAMSTER',
}
registerEnumType(PetCategory, { name: 'PetCategory' });

export enum PetStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(PetStatus, { name: 'PetStatus' });
