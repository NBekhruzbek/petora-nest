import { Schema, Types } from 'mongoose';

const BillingSchema = new Schema(
	{
		/** CARD INFO */
		memberId: {
			type: Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		billingKey: {
			type: String,
			required: true,
		},

		last4: {
			type: String,
		},

		cardBrand: {
			type: String,
		},

		cardHolderName: {
			type: String,
		},

		expiryMonth: {
			type: String,
		},

		expiryYear: {
			type: String,
		},

		companyName: {
			type: String,
		},

		vatNumber: {
			type: String,
		},

		address: {
			type: String,
		},

		city: {
			type: String,
		},

		zipCode: {
			type: String,
		},

		countryName: {
			type: String,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'billings' },
);

export default BillingSchema;
