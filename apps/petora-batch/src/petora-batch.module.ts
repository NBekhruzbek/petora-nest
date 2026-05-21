import { Module } from '@nestjs/common';
import { PetoraBatchController } from './petora-batch.controller';
import { PetoraBatchService } from './petora-batch.service';

@Module({
  imports: [],
  controllers: [PetoraBatchController],
  providers: [PetoraBatchService],
})
export class PetoraBatchModule {}
