import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	OnModuleInit,
} from '@nestjs/common';
import axios from 'axios';
import { PaymentMethod } from '../../libs/enums/order.enum';

const PORTONE_API_BASE = 'https://api.portone.io';

/** The subset of PortOne's payment object this server actually reads. */
export interface PortonePayment {
	id: string;
	status: string;
	orderName?: string;
	currency?: string;
	amount?: { total?: number; paid?: number };
	method?: { type?: string; provider?: string };
	customData?: string;
	channel?: { type?: string; pgProvider?: string };
}

/**
 * Talks to the PortOne V2 REST API.
 *
 * Everything the browser sends about a payment — the amount above all — is
 * attacker-controlled, so a payment only counts once it has been read back
 * from PortOne with this service and matched against a server-computed total.
 */
@Injectable()
export class PortoneService implements OnModuleInit {
	private readonly logger = new Logger(PortoneService.name);

	/** Read lazily: ConfigModule populates process.env before the first request. */
	private get apiSecret(): string {
		return process.env.PORTONE_V2_API_SECRET ?? '';
	}

	public get configured(): boolean {
		return Boolean(this.apiSecret);
	}

	/**
	 * Says so at boot when the secret is missing.
	 *
	 * Without this the first sign of trouble is a customer who has already paid
	 * and cannot be given an order — the one moment where a clear log is worth
	 * the least and a loud startup warning would have been worth the most.
	 */
	public onModuleInit(): void {
		if (this.configured) return;
		this.logger.warn(
			'PORTONE_V2_API_SECRET is not set — checkout will take payments it cannot verify, ' +
				'and every order will fail after the customer has paid. Set it in .env and restart.',
		);
	}

	public async getPayment(paymentId: string): Promise<PortonePayment> {
		if (!this.configured) {
			throw new InternalServerErrorException('PORTONE_V2_API_SECRET is not configured');
		}

		try {
			const { data } = await axios.get<PortonePayment>(
				`${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}`,
				{
					headers: { Authorization: `PortOne ${this.apiSecret}` },
					timeout: 10_000,
				},
			);
			return data;
		} catch (err) {
			// A 404 means the browser handed us an id PortOne never issued.
			if (axios.isAxiosError(err) && err.response?.status === 404) {
				throw new BadRequestException('Payment not found');
			}
			this.logger.error(`getPayment failed for ${paymentId}`, err instanceof Error ? err.message : err);
			throw new InternalServerErrorException('Payment lookup failed');
		}
	}

	/**
	 * Returns the payment only when it is genuinely paid, in won, for exactly
	 * `expectedAmount`. Anything else is a client error — never an order.
	 */
	public async verifyPaid(paymentId: string, expectedAmount: number): Promise<PortonePayment> {
		const payment = await this.getPayment(paymentId);

		if (payment.status !== 'PAID') {
			throw new BadRequestException(`Payment is not completed (status: ${payment.status})`);
		}
		if (payment.currency && payment.currency !== 'KRW') {
			throw new BadRequestException(`Unsupported payment currency: ${payment.currency}`);
		}
		if (payment.amount?.total !== expectedAmount) {
			this.logger.warn(`Amount mismatch on ${paymentId}: paid ${payment.amount?.total}, expected ${expectedAmount}`);
			throw new BadRequestException('Paid amount does not match the order total');
		}

		return payment;
	}

	/**
	 * Best-effort refund, for when a payment succeeds but the order it was for
	 * cannot be recorded. Failures are logged rather than thrown so they never
	 * mask the error that triggered the cancellation.
	 */
	public async cancelPayment(paymentId: string, reason: string): Promise<void> {
		if (!this.configured) return;

		try {
			await axios.post(
				`${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}/cancel`,
				{ reason },
				{ headers: { Authorization: `PortOne ${this.apiSecret}` }, timeout: 10_000 },
			);
			this.logger.log(`Cancelled payment ${paymentId}: ${reason}`);
		} catch (err) {
			this.logger.error(
				`Could not cancel payment ${paymentId} — refund it by hand in the PortOne console`,
				err instanceof Error ? err.message : err,
			);
		}
	}

	/** PortOne's method type ("PaymentMethodEasyPay") onto our own enum. */
	public toPaymentMethod(payment: PortonePayment): PaymentMethod {
		const type = payment.method?.type ?? '';
		if (type.includes('EasyPay')) return PaymentMethod.EASY_PAY;
		if (type.includes('VirtualAccount')) return PaymentMethod.VIRTUAL_ACCOUNT;
		if (type.includes('Transfer')) return PaymentMethod.TRANSFER;
		if (type.includes('Mobile')) return PaymentMethod.MOBILE;
		return PaymentMethod.CARD;
	}
}
