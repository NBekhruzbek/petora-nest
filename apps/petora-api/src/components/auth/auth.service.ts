import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
	public async hashPassword(memberPassord: string): Promise<string> {
		const salt = await bcrypt.genSalt();

		return bcrypt.hash(memberPassord, salt);
	}

	public async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}
}
