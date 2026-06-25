import { registerEnumType } from '@nestjs/graphql';

export enum QnaStatus {
	ACTIVE = 'ACTIVE',
	HIDE = 'HIDE',
	DELETE = 'DELETE',
}
registerEnumType(QnaStatus, { name: 'QnaStatus' });
