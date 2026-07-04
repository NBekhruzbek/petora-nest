import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, Products } from '../../libs/dto/product/product';
import { OrdinaryInquiry, ProductInput, ProductsInquiry } from '../../libs/dto/product/product.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import { lookupAuthMemberLiked, shapeIntoMongoObjectId } from '../../libs/config';
import { StatisticModifier, T } from '../../libs/types/common';
import { ProductStatus, ProductType } from '../../libs/enums/product.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';

@Injectable()
export class ProductService {
	constructor(
		@InjectModel('Product') private readonly productModel: Model<Product>,
		private viewService: ViewService,
		private likeService: LikeService,
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

				// meLiked?
				const likeInput = {
					memberId: viewerId,
					likeRefId: targetId,
					likeGroup: LikeGroup.PRODUCT,
				};
				targetProduct.meLiked = await this.likeService.checkLikeExistence(likeInput);
			}

			return targetProduct;
		} catch (err) {
			console.log('Error, Product.model:', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}
	}

	public async getProducts(memberId: Types.ObjectId, input: ProductsInquiry): Promise<Products> {
		const match: T = { productStatus: ProductStatus.ACTIVE };
		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId, '$_id'),
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result[0].list.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetProduct(memberid: Types.ObjectId, likeRefId: Types.ObjectId): Promise<Product> {
		const target: Product = await this.productModel
			.findOne({ _id: likeRefId, productStatus: ProductStatus.ACTIVE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberid,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.PRODUCT,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.productStatsEditor({ _id: likeRefId, targetKey: 'productLikes', modifier: modifier });
		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

		return result;
	}

	private shapeMatchQuery(match: T, input: ProductsInquiry): void {
		const { priceRange, productPetType, productType, text } = input.search;
		if (productPetType && productPetType.length) match.productPetType = { $in: productPetType };
		if (productType && productType.length) match.productType = { $in: productType };
		if (text) match.productName = { $regex: new RegExp(text, 'i') };

		if (priceRange) {
			match.productPriceAfterDiscount = {};
			if (priceRange.min !== undefined) match.productPriceAfterDiscount.$gte = priceRange.min;
			if (priceRange.max !== undefined) match.productPriceAfterDiscount.$lte = priceRange.max;
		}
	}

	public async getFavoriteProducts(memberId: Types.ObjectId, input: OrdinaryInquiry): Promise<Products> {
		return await this.likeService.getFavoriteProducts(memberId, input);
	}

	public async getAllProductsByAdmin(input: ProductsInquiry): Promise<Products> {
		const match: T = {};
		if (input.search.productStatus?.length) match.productStatus = { $in: input.search.productStatus };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result[0].list.length) return { list: [], metaCounter: [] };

		return result[0];
	}

	public async getRelatedProducts(memberId: Types.ObjectId, input: string): Promise<Product[]> {
		const productId = shapeIntoMongoObjectId(input);
		const search: T = {
			_id: productId,
			productStatus: {
				$in: [ProductStatus.ACTIVE, ProductStatus.PAUSE],
			},
		};
		const targetProduct: Product = await this.productModel.findOne(search).exec();
		if (!targetProduct) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return this.productModel
			.aggregate([
				{
					$match: {
						_id: { $ne: productId },
						productPetType: targetProduct.productPetType,
						productStatus: ProductStatus.ACTIVE,
					},
				},
				{ $sort: { productLikes: -1 } },
				{ $limit: 5 },
				lookupAuthMemberLiked(memberId),
			])
			.exec();
	}

	public async productStatsEditor(input: StatisticModifier): Promise<Product> {
		console.log('productStatsEditor: Executed');
		const { _id, targetKey, modifier } = input;
		return await this.productModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec();
	}
}
