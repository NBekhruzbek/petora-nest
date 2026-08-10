import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Order } from '../../libs/dto/order/order';
import { InvoiceLine, orderInvoiceHtml, passwordResetHtml } from './mail.templates';

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name);
	private transporter: nodemailer.Transporter | null = null;

	private getTransporter(): nodemailer.Transporter {
		if (!this.transporter) {
			this.transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: Number(process.env.SMTP_PORT ?? 587),
				secure: Number(process.env.SMTP_PORT) === 465,
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASS,
				},
			});
		}
		return this.transporter;
	}

	public async sendOrderInvoice(to: string, order: Order, lines: InvoiceLine[]): Promise<void> {
		try {
			await this.getTransporter().sendMail({
				from: process.env.MAIL_FROM,
				to: to,
				subject: `Petora — 거래명세서 / Invoice (${order.orderNumber})`,
				html: orderInvoiceHtml(order, lines),
			});
		} catch (err) {
			this.logger.error(
				`Invoice email failed, order ${order.orderNumber}: ${err instanceof Error ? err.message : err}`,
			);
		}
	}

	public async sendPasswordResetCode(to: string, memberUserName: string, code: string, minutes: number): Promise<void> {
		try {
			await this.getTransporter().sendMail({
				from: process.env.MAIL_FROM,
				to: to,
				subject: `Petora — 비밀번호 재설정 인증 코드 / Password reset code`,
				html: passwordResetHtml(memberUserName, code, minutes),
			});
		} catch (err) {
			this.logger.error(`Reset email failed for ${memberUserName}: ${err instanceof Error ? err.message : err}`);
			throw err;
		}
	}
}
