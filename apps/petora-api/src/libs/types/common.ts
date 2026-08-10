import { Types } from 'mongoose';

export interface T {
	[key: string]: any;
}

export interface StatisticModifier {
	_id: Types.ObjectId;
	targetKey: string;
	modifier: number;
}

export interface PasswordReset {
	_id: Types.ObjectId;
	memberId: Types.ObjectId;
	codeHash: string;
	resetTokenHash?: string;
	attempts: number;
	consumedAt?: Date;
	expiresAt: Date;
}
