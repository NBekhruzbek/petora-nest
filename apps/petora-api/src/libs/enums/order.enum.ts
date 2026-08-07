import { registerEnumType } from '@nestjs/graphql';

/**
 * One value per stage of the customer's delivery tracker (the STAGES array in
 * `libs/components/mypage/BookingsOrders.tsx`), in the same order. Holding them
 * 1:1 with the stages is what keeps the two from drifting apart — PROCESSED is
 * the state an order is created in, so stage 1 ticks as soon as it is placed.
 */
export enum OrderStatus {
	PROCESSED = 'PROCESSED',
	SHIPPED = 'SHIPPED',
	EN_ROUTE = 'EN_ROUTE',
	ARRIVED = 'ARRIVED',
	CANCELLED = 'CANCELLED',
}
registerEnumType(OrderStatus, { name: 'OrderStatus' });

export enum PaymentMethod {
	CARD = 'CARD',
	EASY_PAY = 'EASY_PAY',
	TRANSFER = 'TRANSFER',
	VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
	MOBILE = 'MOBILE',
	CASH_TO_DELIVERY = 'CASH_TO_DELIVERY',
}
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });
