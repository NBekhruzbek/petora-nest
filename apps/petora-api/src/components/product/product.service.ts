import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../libs/dto/product/product';
import { ProductInput } from '../../libs/dto/product/product.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class ProductService {
	constructor(@InjectModel('Product') private readonly productModel: Model<Product>) {}

	public async createProduct(input: ProductInput): Promise<Product> {
		try {
			if (input.productDiscount > 0) {
				input.productPriceAfterDiscount =
					Math.round(input.productPrice * (1 - input.productDiscount / 100) * 100) / 100;
			}
			const result: Product = await this.productModel.create(input);
			return result;
		} catch (err) {
			console.log('Error, Product.model:', err instanceof Error ? err.message : err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}
}
