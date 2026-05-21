import { Controller, Get } from '@nestjs/common';
import { PetoraBatchService } from './petora-batch.service';

@Controller()
export class PetoraBatchController {
  constructor(private readonly petoraBatchService: PetoraBatchService) {}

  @Get()
  getHello(): string {
    return this.petoraBatchService.getHello();
  }
}
