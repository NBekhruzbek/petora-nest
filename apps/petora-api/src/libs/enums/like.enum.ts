import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
	AGENT = 'AGENT',
	SERVICE = 'SERVICE',
	PRODUCT = 'PRODUCT',
	ARTICLE = 'ARTICLE',
	QNA = 'QNA',
	COMMENT = 'COMMENT',
	PET = 'PET',
}
registerEnumType(LikeGroup, { name: 'LikeGroup' });
