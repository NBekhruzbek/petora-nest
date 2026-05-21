import { NestFactory } from '@nestjs/core';
import { PetoraBatchModule } from './petora-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(PetoraBatchModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
