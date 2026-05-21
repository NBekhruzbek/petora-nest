import { Injectable } from '@nestjs/common';

@Injectable()
export class PetoraBatchService {
	getHello(): string {
		return 'Welcome to Petora BATCH Server!';
	}
}
