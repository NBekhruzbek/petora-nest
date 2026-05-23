import { registerEnumType } from '@nestjs/graphql';

export enum NoticeType {
	IMPORTANT = 'IMPORTANT',
	UPDATE = 'UPDATE',
}
registerEnumType(NoticeType, { name: 'NoticeType' });
