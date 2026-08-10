import { Order } from '../../libs/dto/order/order';
import { PaymentMethod } from '../../libs/enums/order.enum';

export interface InvoiceLine {
	name: string;
	quantity: number;
	price: number;
}

// Korean system faces first: mail clients cannot load web fonts, and
// Arial/Helvetica carry no Hangul glyphs.
const FONT = `-apple-system,'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',Arial,Helvetica,sans-serif`;

// Korean primary, English trailing in lighter grey — one line, same order everywhere.
const bi = (ko: string, en: string): string => `${ko} <span style="color:#9ca3af;font-weight:normal;">/ ${en}</span>`;

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
	[PaymentMethod.CARD]: bi('신용/체크카드', 'Card'),
	[PaymentMethod.EASY_PAY]: bi('간편결제', 'Easy Pay'),
	[PaymentMethod.TRANSFER]: bi('계좌이체', 'Bank Transfer'),
	[PaymentMethod.VIRTUAL_ACCOUNT]: bi('가상계좌', 'Virtual Account'),
	[PaymentMethod.MOBILE]: bi('휴대폰 결제', 'Mobile Payment'),
	[PaymentMethod.CASH_TO_DELIVERY]: bi('착불 결제', 'Cash on Delivery'),
};

const won = (value: number): string => `₩${(value ?? 0).toLocaleString()}`;

// Printed once in a format both audiences read: 2026. 08. 07.
const formatDate = (date: Date): string =>
	new Date(date ?? Date.now()).toLocaleDateString('ko-KR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		timeZone: 'Asia/Seoul',
	});

const layout = (
	title: string,
	subtitleKo: string,
	subtitleEn: string,
	body: string,
	footerKo: string,
	footerEn: string,
): string => `
<div style="margin:0;padding:24px 0;background:#f4f5f7;font-family:${FONT};">
	<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
		<div style="background:#1f2937;padding:24px 32px;">
			<span style="color:#ffffff;font-size:22px;font-weight:bold;">Petora</span>
		</div>
		<div style="padding:32px;">
			<h1 style="margin:0 0 8px;font-size:20px;color:#111827;">${title}</h1>
			<p style="margin:0 0 2px;font-size:14px;color:#6b7280;">${subtitleKo}</p>
			<p style="margin:0 0 24px;font-size:13px;color:#9ca3af;">${subtitleEn}</p>
			${body}
			<p style="margin:32px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">
				${footerKo}
				<br />${footerEn}
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
<table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-family:${FONT};">
	${row(bi('주문번호', 'Order number'), order.orderNumber)}
	${row(bi('주문일자', 'Order date'), formatDate(order.createdAt))}
	${row(bi('결제수단', 'Payment method'), PAYMENT_METHOD_LABEL[order.paymentMethod] ?? String(order.paymentMethod))}
	${row(bi('받는 분', 'Receiver'), order.receiverName)}
	${row(bi('배송지', 'Delivery address'), order.deliveryAddress)}
</table>
<table style="width:100%;border-collapse:collapse;font-family:${FONT};">
	<tr>
		<th style="padding:8px 0;font-size:12px;color:#6b7280;text-align:left;border-bottom:2px solid #e5e7eb;">${bi('상품', 'Item')}</th>
		<th style="padding:8px 0;font-size:12px;color:#6b7280;text-align:center;border-bottom:2px solid #e5e7eb;">${bi('수량', 'Qty')}</th>
		<th style="padding:8px 0;font-size:12px;color:#6b7280;text-align:right;border-bottom:2px solid #e5e7eb;">${bi('금액', 'Amount')}</th>
	</tr>
	${itemRows}
	<tr>
		<td colspan="2" style="padding:8px 0;font-size:14px;color:#6b7280;">${bi('배송비', 'Delivery')}</td>
		<td style="padding:8px 0;font-size:14px;color:#111827;text-align:right;">${
			order.orderDelivery > 0 ? won(order.orderDelivery) : bi('무료', 'Free')
		}</td>
	</tr>
	<tr>
		<td colspan="2" style="padding:12px 0 0;font-size:16px;font-weight:bold;color:#111827;border-top:2px solid #111827;">${bi(
			'총 결제금액',
			'Total',
		)}</td>
		<td style="padding:12px 0 0;font-size:16px;font-weight:bold;color:#111827;text-align:right;border-top:2px solid #111827;">${won(
			order.orderTotal,
		)}</td>
	</tr>
</table>`;

	return layout(
		bi('거래명세서', 'Invoice'),
		`${order.receiverName}님, 주문해 주셔서 감사합니다.`,
		`Thank you for your order, ${order.receiverName}.`,
		body,
		'본 메일은 Petora에서 자동 발송된 거래명세서입니다. 문의사항은 본 메일로 회신해 주세요.',
		'This is an automatically generated invoice from Petora. If you have any questions, reply to this email.',
	);
};

export const passwordResetHtml = (memberUserName: string, code: string, minutes: number): string => {
	const body = `
<div style="margin:0 0 24px;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;text-align:center;">
	<p style="margin:0 0 8px;font-size:12px;color:#6b7280;">${bi('인증 코드', 'Verification code')}</p>
	<p style="margin:0;font-size:32px;font-weight:bold;color:#111827;letter-spacing:8px;font-family:${FONT};">${code}</p>
</div>
<table style="width:100%;border-collapse:collapse;font-family:${FONT};">
	${row(bi('계정', 'Account'), memberUserName)}
	${row(bi('유효시간', 'Valid for'), bi(`${minutes}분`, `${minutes} minutes`))}
</table>
<p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
	본인이 요청하지 않았다면 이 메일을 무시하세요. 비밀번호는 변경되지 않습니다.
	<br /><span style="color:#9ca3af;">If you did not request this, ignore this email — your password will not change.</span>
</p>`;

	return layout(
		bi('비밀번호 재설정', 'Password reset'),
		`${memberUserName}님, 아래 인증 코드를 입력해 주세요.`,
		`${memberUserName}, enter the verification code below to continue.`,
		body,
		'본 메일은 Petora에서 자동 발송되었습니다. 인증 코드는 누구에게도 알려주지 마세요.',
		'This email was sent automatically by Petora. Never share your verification code with anyone.',
	);
};
