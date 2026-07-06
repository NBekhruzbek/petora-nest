import { BATCH_ROLLBACK, BATCH_TOP_AGENTS, BATCH_TOP_PRODUCTS, BATCH_TOP_SERVICES } from './lib/config';
import { PetoraBatchService } from './petora-batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { Controller, Get, Logger } from '@nestjs/common';

@Controller()
export class PetoraBatchController {
	private logger: Logger = new Logger('BatchController');

	constructor(private readonly petoraBatchService: PetoraBatchService) {}

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY!');
	}

	@Cron('00 00 00 * * *', { name: BATCH_ROLLBACK })
	public async batchRollback() {
		try {
			this.logger['context'] = BATCH_ROLLBACK;
			this.logger.debug('EXECUTED!');
			await this.petoraBatchService.batchRollback();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('15 00 00 * * *', { name: BATCH_TOP_PRODUCTS })
	public async batchTopProducts() {
		try {
			this.logger['context'] = BATCH_TOP_PRODUCTS;
			this.logger.debug('EXECUTED!');
			await this.petoraBatchService.batchTopProducts();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('30 00 00 * * *', { name: BATCH_TOP_SERVICES })
	public async batchTopServices() {
		try {
			this.logger['context'] = BATCH_TOP_SERVICES;
			this.logger.debug('EXECUTED!');
			await this.petoraBatchService.batchTopServices();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('45 00 00 * * *', { name: BATCH_TOP_AGENTS })
	public async batchTopAgents() {
		try {
			this.logger['context'] = BATCH_TOP_AGENTS;
			this.logger.debug('EXECUTED!');
			await this.petoraBatchService.batchTopAgents();
		} catch (err) {
			this.logger.error(err);
		}
	}

	/**
	 @Interval(1000)
	 handleInterval() {
		 this.logger.debug('INTERVAL TEST');
	 }
	 */

	@Get()
	getHello(): string {
		return this.petoraBatchService.getHello();
	}
}
