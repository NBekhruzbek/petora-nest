import { Order } from '../../libs/dto/order/order';
import { PaymentMethod } from '../../libs/enums/order.enum';

export interface InvoiceLine {
	name: string;
	quantity: number;
	price: number;
}

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
	[PaymentMethod.CARD]: 'Card',
	[PaymentMethod.EASY_PAY]: 'Easy Pay',
	[PaymentMethod.TRANSFER]: 'Bank Transfer',
	[PaymentMethod.VIRTUAL_ACCOUNT]: 'Virtual Account',
	[PaymentMethod.MOBILE]: 'Mobile Payment',
	[PaymentMethod.CASH_TO_DELIVERY]: 'Cash on Delivery',
};

const won = (value: number): string => `₩${(value ?? 0).toLocaleString()}`;

const formatDate = (date: Date): string =>
	new Date(date ?? Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const layout = (title: string, subtitle: string, body: string): string => `
<div style="margin:0;padding:24px 0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
	<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
		<div style="background:#1f2937;padding:24px 32px;">
			<span style="color:#ffffff;font-size:22px;font-weight:bold;">Petora</span>
		</div>
		<div style="padding:32px;">
			<h1 style="margin:0 0 4px;font-size:20px;color:#111827;">${title}</h1>
			<p style="margin:0 0 24px;font-size:14px;color:#6b7280;">${subtitle}</p>
			${body}
			<p style="margin:32px 0 0;font-size:12px;color:#9ca3af;">
				This is an automatically generated invoice from Petora. If you have any questions, reply to this email.
			</p>
		</div>
	</div>
</div>`;

const row = (label: string, value: string): string => `
<tr>
	<td style="padding:6px 0;font-size:14px;color:#6b7280;">${label}</td>
	<td style="padding:6px 0;font-size:14px;color:#111827;text-align:right;">${value}</td>
</tr>`;

export const orderInvoiceHtml = (order: Order, lines: InvoiceLine[]): string => {
	const itemRows = lines
		.map(
			(line) => `
<tr>
	<td style="padding:8px 0;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${line.name}</td>
	<td style="padding:8px 0;font-size:14px;color:#6b7280;text-align:center;border-bottom:1px solid #f3f4f6;">×${line.quantity}</td>
	<td style="padding:8px 0;font-size:14px;color:#111827;text-align:right;border-bottom:1px solid #f3f4f6;">${won(line.price * line.quantity)}</td>
</tr>`,
		)
		.join('');

	const body = `
<table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
	${row('Order number', order.orderNumber)}
	${row('Order date', formatDate(order.createdAt))}
	${row('Payment method', PAYMENT_METHOD_LABEL[order.paymentMethod] ?? String(order.paymentMethod))}
	${row('Receiver', order.receiverName)}
	${row('Delivery address', order.deliveryAddress)}
</table>
<table style="width:100%;border-collapse:collapse;">
	<tr>
		<th style="padding:8px 0;font-size:12px;color:#6b7280;text-align:left;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Item</th>
		<th style="padding:8px 0;font-size:12px;color:#6b7280;text-align:center;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Qty</th>
		<th style="padding:8px 0;font-size:12px;color:#6b7280;text-align:right;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Amount</th>
	</tr>
	${itemRows}
	<tr>
		<td colspan="2" style="padding:8px 0;font-size:14px;color:#6b7280;">Delivery</td>
		<td style="padding:8px 0;font-size:14px;color:#111827;text-align:right;">${order.orderDelivery > 0 ? won(order.orderDelivery) : 'Free'}</td>
	</tr>
	<tr>
		<td colspan="2" style="padding:12px 0 0;font-size:16px;font-weight:bold;color:#111827;border-top:2px solid #111827;">Total</td>
		<td style="padding:12px 0 0;font-size:16px;font-weight:bold;color:#111827;text-align:right;border-top:2px solid #111827;">${won(order.orderTotal)}</td>
	</tr>
</table>`;

	return layout('Invoice', `Thank you for your order, ${order.receiverName}.`, body);
};
