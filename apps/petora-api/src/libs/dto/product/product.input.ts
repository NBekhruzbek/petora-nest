import { Field, InputType, Int } from '@nestjs/graphql';
import { ProductPetType, ProductStatus, ProductType } from '../../enums/product.enum';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Length, Max, Min } from 'class-validator';

@InputType()
export class ProductInput {
	@IsNotEmpty()
	@Field(() => ProductType)
	productType: ProductType;

	@IsNotEmpty()
	@Field(() => ProductStatus)
	productStatus: ProductStatus;

	@IsNotEmpty()
	@Field(() => ProductPetType)
	productPetType: ProductPetType;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	productName: string;

	@IsNotEmpty()
	@Field(() => [String])
	productImages: string[];

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	productShortDesc: string;

	@IsNotEmpty()
	@Field(() => String)
	productDesc: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productBrand?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productBenefits?: string;

	@IsNotEmpty()
	@IsNumber()
	@Field(() => Number)
	productPrice: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	@Max(100)
	@Field(() => Number)
	productDiscount: number;

	@IsOptional()
	@IsNumber()
	@Field(() => Number, { nullable: true })
	productPriceAfterDiscount?: number;

	@IsNotEmpty()
	@IsInt()
	@Min(0)
	@Field(() => Int)
	productQuantity: number;
}
