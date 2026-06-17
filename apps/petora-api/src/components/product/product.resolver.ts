import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { ProductInput, ProductsInquiry } from '../../libs/dto/product/product.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Product, Products } from '../../libs/dto/product/product';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Types } from 'mongoose';

@Resolver()
export class ProductResolver {
	constructor(private readonly productService: ProductService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Product)
	public async createProduct(@Args('input') input: ProductInput): Promise<Product> {
		console.log('Mutation: createProduct');
		return await this.productService.createProduct(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Product)
	public async updateProduct(@Args('input') input: ProductUpdate): Promise<Product> {
		console.log('Mutation: updateProduct');
		return await this.productService.updateProduct(input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Product)
	public async getProduct(@Args('productId') input: string, @AuthMember('_id') memberId: string): Promise<Product> {
		console.log('Query: getProduct');
		const targetId = shapeIntoMongoObjectId(input);
		const viewerId = shapeIntoMongoObjectId(memberId);
		return await this.productService.getProduct(viewerId, targetId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Products)
	public async getProducts(
		@Args('input') input: ProductsInquiry,
		@AuthMember('_id') memberId: Types.ObjectId,
	): Promise<Products> {
		console.log('Query: getProducts');
		return await this.productService.getProducts(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Products)
	public async getAllProductsByAdmin(@Args('input') input: ProductsInquiry): Promise<Products> {
		console.log('Query: getAllProductsByAdmin');
		return this.productService.getAllProductsByAdmin(input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => [Product])
	public async getRelatedProducts(@Args('productId') input: string): Promise<Product[]> {
		console.log('Query: getRelatedProducts');
		return await this.productService.getRelatedProducts(input);
	}
}
