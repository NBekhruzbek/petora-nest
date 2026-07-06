import { Injectable } from '@nestjs/common';

@Injectable()
export class PetoraBatchService {
	public async batchRollback(): Promise<void> {
		console.log('batchRollback');
	}

	public async batchTopProducts(): Promise<void> {
		console.log('batchProducts');
	}

	public async batchTopServices(): Promise<void> {
		console.log('batchServices');
	}

	public async batchTopAgents(): Promise<void> {
		console.log('batchAgents');
	}

	getHello(): string {
		return 'Welcome to Petora BATCH Server!';
	}
}
