import { ObjectId } from 'bson';

export const availableAgentSorts = [
	'createdAt',
	'updatedAt',
	'memberLikes',
	'memberViews',
	'memberRating',
	'memberBooking',
	'memberRank',
];

export const availableProductSorts = [
	'createdAt',
	'productRating',
	'productRank',
	'productLikes',
	'productSoldTimes',
	'productPriceAfterDiscount',
];

export const availableServiceSorts = [
	'createdAt',
	'serviceRating',
	'serviceLikes',
	'mostBooked',
	'servicePrice',
	'serviceRank',
];

export const availableBookingSorts = ['createdAt', 'updatedAt'];

export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];

export const availableQnaSorts = ['createdAt', 'updatedAt', 'questionAnswers', 'questionViews', 'questionLikes'];

export const availableFaqSorts = ['createdAt', 'updatedAt'];

export const availableNoticeSorts = ['createdAt', 'updatedAt'];

export const availableCommentSorts = ['createdAt', 'updatedAt'];

export const availableReviewSorts = ['createdAt', 'reviewRating'];

export const availableCountries = {
	KR: 'South Korea',
	US: 'United States',
	GB: 'United Kingdom',
	JP: 'Japan',
	CA: 'Canada',
	AU: 'Australia',
	DE: 'Germany',
	FR: 'France',
	UZ: 'Uzbekistan',
};

/** IMAGE CONFIGURATION */
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
	return {
		$lookup: {
			from: 'likes',
			let: {
				localLikeRefId: targetRefId,
				localMemberId: memberId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						memberId: 1,
						likeRefId: 1,
						myFavorite: '$$localMyFavorite',
					},
				},
			],
			as: 'meLiked',
		},
	};
};

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};

export const lookupFavoriteProducts = {
	$lookup: {
		from: 'members',
		localField: 'favoriteProducts.memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};

export const lookupFavoriteServices = {
	$lookup: {
		from: 'members',
		localField: 'favoriteServices.memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};
