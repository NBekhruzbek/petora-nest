import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { ProductInput } from '../../libs/dto/product/product.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Product } from '../../libs/dto/product/product';
import { ProductUpdate } from '../../libs/dto/product/product.update';

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
}
