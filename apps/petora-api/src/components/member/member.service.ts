import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberService {
	public async signup(): Promise<string> {
		return 'signup executed';
	}

	public async login(): Promise<string> {
		return 'login executed';
	}

	public async updateMember(): Promise<string> {
		return 'update executed';
	}

	public async getMember(): Promise<string> {
		return 'getMember executed';
	}
}
