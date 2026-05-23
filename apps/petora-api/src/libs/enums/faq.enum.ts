import { registerEnumType } from '@nestjs/graphql';

export enum FaqType {
	ORDERS_PAYMENTS = 'ORDERS_PAYMENTS',
	DELIVERY_TRACKING = 'DELIVERY_TRACKING',
	RETURNS_REFUNDS = 'RETURNS_REFUNDS',
	ACCOUNT_SECURITY = 'ACCOUNT_SECURITY',
	PET_SERVICES = 'PET_SERVICES',
}
registerEnumType(FaqType, { name: 'FaqType' });

export enum FaqStatus {
	ACTIVE = 'ACTIVE',
	HIDE = 'HIDE',
	DELETE = 'DELETE',
}
registerEnumType(FaqStatus, { name: 'FaqStatus' });
