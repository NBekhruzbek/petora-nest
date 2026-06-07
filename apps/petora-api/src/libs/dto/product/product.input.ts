import { Field, InputType, Int } from '@nestjs/graphql';
import { ProductPetType, ProductStatus, ProductType } from '../../enums/product.enum';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, Length, Max, Min } from 'class-validator';
import { Direction } from '../../enums/common.enum';
import { Types } from 'mongoose';
import { availableProductSorts } from '../../config';

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
	@Length(3, 250)
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

@InputType()
class PriceRange {
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Field(() => Number, { nullable: true })
	min?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(5000000)
	@Field(() => Number, { nullable: true })
	max?: number;
}

@InputType()
class PISearch {
	@IsOptional()
	@Field(() => PriceRange, { nullable: true })
	priceRange?: PriceRange;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	onlyLiked: boolean;

	@IsOptional()
	@Field(() => [ProductPetType], { nullable: true })
	productPetType?: ProductPetType[];

	@IsOptional()
	@Field(() => [ProductType], { nullable: true })
	productType?: ProductType[];

	@IsOptional()
	@Field(() => [ProductStatus], { nullable: true })
	productStatus?: ProductStatus[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class ProductsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableProductSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => PISearch)
	search: PISearch;
}
