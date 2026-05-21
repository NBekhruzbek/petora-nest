import { Module } from '@nestjs/common';
import { PetoraBatchController } from './petora-batch.controller';
import { PetoraBatchService } from './petora-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [ConfigModule.forRoot()],
	controllers: [PetoraBatchController],
	providers: [PetoraBatchService],
})
export class PetoraBatchModule {}
