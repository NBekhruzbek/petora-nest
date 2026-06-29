import { registerEnumType } from '@nestjs/graphql';

export enum NoticeType {
	IMPORTANT = 'IMPORTANT',
	UPDATE = 'UPDATE',
	EVENT = 'EVENT',
	ANNOUNCEMENT = 'ANNOUNCEMENT',
}
registerEnumType(NoticeType, { name: 'NoticeType' });

export enum NoticeStatus {
	ACTIVE = 'ACTIVE',
	HIDE = 'HIDE',
	DELETE = 'DELETE',
}
registerEnumType(NoticeStatus, { name: 'NoticeStatus' });
