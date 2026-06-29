import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	AGENT = 'AGENT',
	SERVICE = 'SERVICE',
	PRODUCT = 'PRODUCT',
	ARTICLE = 'ARTICLE',
	QNA = 'QNA',
	FAQ = 'FAQ',
	NOTICE = 'NOTICE',
}
registerEnumType(ViewGroup, { name: 'ViewGroup' });
