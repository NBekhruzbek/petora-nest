import { ObjectId } from 'bson';

export const availableAgentSorts = [
	'createdAt',
	'updatedAt',
	'memberLikes',
	'memberViews',
	'memberRank',
	'memberBooking',
];

export const availableProductSorts = [
	'createdAt',
	'productRating',
	'productLikes',
	'productSoldTimes',
	'productPriceAfterDiscount',
];

export const availableServiceSorts = ['createdAt', 'serviceRating', 'serviceLikes', 'mostBooked', 'servicePrice'];

export const availableBookingSorts = ['createdAt', 'updatedAt'];

export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];

export const availableQnaSorts = ['createdAt', 'updatedAt', 'questionAnswers', 'questionViews', 'questionLikes'];

export const availableFaqSorts = ['createdAt', 'updatedAt'];

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

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};
