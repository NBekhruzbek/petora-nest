import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';
import { JwtService } from '@nestjs/jwt';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class AuthService {
	private readonly googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

	constructor(private jwtService: JwtService) {}

	public async hashPassword(memberPassord: string): Promise<string> {
		const salt = await bcrypt.genSalt();

		return bcrypt.hash(memberPassord, salt);
	}

	public async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}

	public async createToken(member: Member): Promise<string> {
		const payload: T = {};

		Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
			payload[`${ele}`] = member[`${ele}`];
		});
		delete payload.memberPassword;

		return this.jwtService.signAsync(payload);
	}

	public async verifyToken(token: string): Promise<Member> {
		const member = await this.jwtService.verifyAsync(token);
		member._id = shapeIntoMongoObjectId(member._id);
		return member;
	}

	public async verifyGoogleToken(idToken: string): Promise<TokenPayload> {
		let ticket;
		try {
			ticket = await this.googleClient.verifyIdToken({
				idToken,
				audience: process.env.GOOGLE_CLIENT_ID,
			});
		} catch (err) {
			throw new UnauthorizedException(Message.INVALID_GOOGLE_TOKEN);
		}

		const payload = ticket.getPayload();
		if (!payload || !payload.email || !payload.email_verified) {
			throw new UnauthorizedException(Message.INVALID_GOOGLE_TOKEN);
		}

		return payload;
	}
}
