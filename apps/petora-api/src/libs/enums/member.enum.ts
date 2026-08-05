import { registerEnumType } from '@nestjs/graphql';

export enum MemberType {
	ADMIN = 'ADMIN',
	AGENT = 'AGENT',
	USER = 'USER',
}
registerEnumType(MemberType, { name: 'MemberType' });

export enum MemberStatus {
	ACTIVE = 'ACTIVE',
	BLOCK = 'BLOCK',
	DELETE = 'DELETE',
}
registerEnumType(MemberStatus, { name: 'MemberStatus' });

export enum MemberAuthType {
	PHONE = 'PHONE',
	EMAIL = 'EMAIL',
	TELEGRAM = 'TELEGRAM',
	GOOGLE = 'GOOGLE',
}
registerEnumType(MemberAuthType, { name: 'MemberAuthType' });
