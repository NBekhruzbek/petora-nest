import { Test, TestingModule } from '@nestjs/testing';
import { PetoraBatchController } from './petora-batch.controller';
import { PetoraBatchService } from './petora-batch.service';

describe('PetoraBatchController', () => {
  let petoraBatchController: PetoraBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PetoraBatchController],
      providers: [PetoraBatchService],
    }).compile();

    petoraBatchController = app.get<PetoraBatchController>(PetoraBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(petoraBatchController.getHello()).toBe('Hello World!');
    });
  });
});
