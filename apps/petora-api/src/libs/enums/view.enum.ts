import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	AGENT = 'AGENT',
	SERVICE = 'SERVICE',
	PRODUCT = 'PRODUCT',
	ARTICLE = 'ARTICLE',
	QNA = 'QNA',
}
registerEnumType(ViewGroup, { name: 'ViewGroup' });
