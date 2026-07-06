import { Module } from '@nestjs/common';
import { PetoraBatchController } from './petora-batch.controller';
import { PetoraBatchService } from './petora-batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [ConfigModule.forRoot(), DatabaseModule, ScheduleModule.forRoot()],
	controllers: [PetoraBatchController],
	providers: [PetoraBatchService],
})
export class PetoraBatchModule {}
