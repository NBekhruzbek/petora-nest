import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	SHIPPED = 'SHIPPED',
	DELIVERED = 'DELIVERED',
	CANCELLED = 'CANCELLED',
}
registerEnumType(OrderStatus, { name: 'OrderStatus' });

export enum PaymentMethod {
	CARD = 'CARD',
	CASH_TO_DELIVERY = 'CASH_TO_DELIVERY',
}
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });
