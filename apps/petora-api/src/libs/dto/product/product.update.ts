import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Length, Max, Min } from 'class-validator';
import { Types } from 'mongoose';
import { ProductPetType, ProductStatus, ProductType } from '../../enums/product.enum';

@InputType()
export class ProductUpdate {
	@IsNotEmpty()
	@Field(() => String)
	productId: Types.ObjectId;

	@IsOptional()
	@Field(() => ProductType, { nullable: true })
	productType?: ProductType;

	@IsOptional()
	@Field(() => ProductStatus, { nullable: true })
	productStatus?: ProductStatus;

	@IsOptional()
	@Field(() => ProductPetType, { nullable: true })
	productPetType?: ProductPetType;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productName?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	productImages?: string[];

	@IsOptional()
	@Length(3, 250)
	@Field(() => String, { nullable: true })
	productShortDesc?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productDesc?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productBrand?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productBenefits?: string;

	@IsOptional()
	@IsNumber()
	@Field(() => Number, { nullable: true })
	productPrice?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	@Field(() => Number, { nullable: true })
	productDiscount?: number;

	@IsOptional()
	@IsNumber()
	@Field(() => Number, { nullable: true })
	productPriceAfterDiscount?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	productQuantity?: number;

	deletedAt?: Date;
}
