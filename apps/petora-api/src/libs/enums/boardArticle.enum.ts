import { registerEnumType } from '@nestjs/graphql';

export enum ArticleCategory {
	FREE = 'FREE',
	NEWS = 'NEWS',
}
registerEnumType(ArticleCategory, { name: 'ArticleCategory' });

export enum ArticleStatus {
	ACTIVE = 'ACTIVE',
	HIDE = 'HIDE',
	DELETE = 'DELETE',
}
registerEnumType(ArticleStatus, { name: 'ArticleStatus' });
