import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../../libs/dto/product/product';
import { ProductInput } from '../../libs/dto/product/product.input';
import { Message } from '../../libs/enums/common.enum';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { T } from '../../libs/types/common';
import { ProductStatus } from '../../libs/enums/product.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';

@Injectable()
export class ProductService {
	constructor(
		@InjectModel('Product') private readonly productModel: Model<Product>,
		private viewService: ViewService,
	) {}

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

	public async updateProduct(input: ProductUpdate): Promise<Product> {
		try {
			input.productId = shapeIntoMongoObjectId(input.productId);
			const { productId, ...updateFields } = input;

			if (updateFields.productDiscount !== undefined || updateFields.productPrice !== undefined) {
				const existing = await this.productModel.findById(productId).lean();
				if (!existing) throw new InternalServerErrorException(Message.UPDATE_FAILED);

				const price = updateFields.productPrice ?? existing.productPrice;
				const discount = updateFields.productDiscount ?? existing.productDiscount ?? 0;

				updateFields.productPriceAfterDiscount =
					discount > 0 ? Math.round(price * (1 - discount / 100) * 100) / 100 : price;
			}

			const result: Product = await this.productModel
				.findOneAndUpdate(
					{
						_id: input.productId,
					},
					{ $set: updateFields },
					{ new: true },
				)
				.exec();
			if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

			return result;
		} catch (err) {
			console.log('Error, Product.model:', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}
	}

	public async getProduct(viewerId: Types.ObjectId, targetId: Types.ObjectId): Promise<Product> {
		try {
			const search: T = {
				_id: targetId,
				productStatus: {
					$in: [ProductStatus.ACTIVE, ProductStatus.PAUSE],
				},
			};
			const targetProduct: Product = await this.productModel.findOne(search).lean().exec();
			if (!targetProduct) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

			if (viewerId) {
				const viewInput: ViewInput = {
					memberId: viewerId,
					viewRefId: targetId,
					viewGroup: ViewGroup.PRODUCT,
				};
				const newView = await this.viewService.recordView(viewInput);

				if (newView) {
					await this.productModel.findOneAndUpdate(search, { $inc: { productViews: 1 } }, { new: true }).exec();
					targetProduct.productViews++;
				}
			}

			// meLiked?

			return targetProduct;
		} catch (err) {
			console.log('Error, Product.model:', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}
	}
}
