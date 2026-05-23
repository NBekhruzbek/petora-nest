import { registerEnumType } from '@nestjs/graphql';

export enum ReceiptGroup {
	ORDER = 'ORDER',
	BOOKING = 'BOOKING',
}
registerEnumType(ReceiptGroup, { name: 'ReceiptGroup' });
