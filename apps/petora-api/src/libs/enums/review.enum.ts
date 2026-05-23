import { registerEnumType } from '@nestjs/graphql';

export enum ReviewStatus {
	ACTIVE = 'ACTIVE',
	HIDE = 'HIDE',
	DELETE = 'DELETE',
}
registerEnumType(ReviewStatus, { name: 'ReviewStatus' });

export enum ReviewGroup {
	SERVICE = 'SERVICE',
	PRODUCT = 'PRODUCT',
	AGENT = 'AGENT',
}
registerEnumType(ReviewGroup, { name: 'ReviewGroup' });
