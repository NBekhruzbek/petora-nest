import { registerEnumType } from '@nestjs/graphql';

export enum NoticeType {
	IMPORTANT = 'IMPORTANT',
	UPDATE = 'UPDATE',
	EVENT = 'EVENT',
	ANNOUNCEMENT = 'ANNOUNCEMENT',
}
registerEnumType(NoticeType, { name: 'NoticeType' });
