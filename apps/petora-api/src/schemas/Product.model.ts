import { Schema } from 'mongoose';
import { ProductPetType, ProductStatus, ProductType } from '../libs/enums/product.enum';

const ProductSchema = new Schema(
	{
		productType: {
			type: String,
			enum: ProductType,
			required: true,
		},

		productStatus: {
			type: String,
			enum: ProductStatus,
			default: ProductStatus.PAUSE,
		},

		productPetType: {
			type: String,
			enum: ProductPetType,
			required: true,
		},

		productName: {
			type: String,
			required: true,
			index: { unique: true, sparse: true },
		},

		productImages: {
			type: [String],
			required: true,
		},

		productShortDesc: {
			type: String,
			required: true,
		},

		productDesc: {
			type: String,
			required: true,
		},

		productBrand: {
			type: String,
		},

		productBenefits: {
			type: String,
		},

		productPrice: {
			type: Number,
			required: true,
		},

		productDiscount: {
			type: Number,
			default: 0,
		},

		productPriceAfterDiscount: {
			type: Number,
		},

		productQuantity: {
			type: Number,
			default: 0,
		},

		productLikes: {
			type: Number,
			default: 0,
		},

		productViews: {
			type: Number,
			default: 0,
		},

		productReviews: {
			type: Number,
			default: 0,
		},

		productRating: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true, collection: 'products' },
);

export default ProductSchema;
