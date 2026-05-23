import { registerEnumType } from '@nestjs/graphql';

export enum CommentStatus {
	ACTIVE = 'ACTIVE',
	HIDE = 'HIDE',
	DELETE = 'DELETE',
}
registerEnumType(CommentStatus, { name: 'CommentStatus' });

export enum CommentGroup {
	QNA = 'QNA',
	ARTICLE = 'ARTICLE',
}
registerEnumType(CommentGroup, { name: 'CommentGroup' });
