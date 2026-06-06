import { Types } from 'mongoose';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ProductPetType, ProductStatus, ProductType } from '../../enums/product.enum';

@ObjectType()
export class Product {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => ProductType)
	productType: ProductType;

	@Field(() => ProductStatus)
	productStatus: ProductStatus;

	@Field(() => ProductPetType)
	productPetType: ProductPetType;

	@Field(() => String)
	productName: string;

	@Field(() => [String])
	productImages: string[];

	@Field(() => String)
	productShortDesc: string;

	@Field(() => String)
	productDesc: string;

	@Field(() => String, { nullable: true })
	productBrand?: string;

	@Field(() => String, { nullable: true })
	productBenefits?: string;

	@Field(() => Number)
	productPrice: number;

	@Field(() => Number)
	productDiscount: number;

	@Field(() => Number, { nullable: true })
	productPriceAfterDiscount?: number;

	@Field(() => Int)
	productQuantity: number;

	@Field(() => Int)
	productLikes: number;

	@Field(() => Int)
	productViews: number;

	@Field(() => Int)
	productReviews: number;

	@Field(() => Number)
	productRating: number;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
