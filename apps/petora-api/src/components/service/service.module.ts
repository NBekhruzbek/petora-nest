import { Module } from '@nestjs/common';
import { ServiceResolver } from './service.resolver';
import { ServiceService } from './service.service';
import { MongooseModule } from '@nestjs/mongoose';
import ServiceSchema from '../../schemas/Service.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Service',
				schema: ServiceSchema,
			},
		]),
	],
	providers: [ServiceResolver, ServiceService],
})
export class ServiceModule {}
