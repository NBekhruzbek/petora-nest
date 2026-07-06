import ServiceSchema from '../../petora-api/src/schemas/Service.model';
import ProductSchema from '../../petora-api/src/schemas/Product.model';
import MemberSchema from '../../petora-api/src/schemas/Member.model';
import { PetoraBatchController } from './petora-batch.controller';
import { PetoraBatchService } from './petora-batch.service';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		ScheduleModule.forRoot(),
		MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
		MongooseModule.forFeature([{ name: 'Service', schema: ServiceSchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
	],
	controllers: [PetoraBatchController],
	providers: [PetoraBatchService],
})
export class PetoraBatchModule {}
