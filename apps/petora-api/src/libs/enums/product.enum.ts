import { registerEnumType } from '@nestjs/graphql';

export enum ProductType {
	FOOD = 'FOOD',
	TOY = 'TOY',
	CLOTHES = 'CLOTHES',
	HEALTH = 'HEALTH',
	ACCESSORIES = 'ACCESSORIES',
	OTHER = 'OTHER',
}
registerEnumType(ProductType, { name: 'ProductType' });

export enum ProductStatus {
	ACTIVE = 'ACTIVE',
	PAUSE = 'PAUSE',
	DELETE = 'DELETE',
}
registerEnumType(ProductStatus, { name: 'ProductStatus' });

export enum ProductPetType {
	DOG = 'DOG',
	CAT = 'CAT',
	RABBIT = 'RABBIT',
	BIRD = 'BIRD',
	HAMSTER = 'HAMSTER',
	OTHER = 'OTHER',
}
registerEnumType(ProductPetType, { name: 'ProductPetType' });
