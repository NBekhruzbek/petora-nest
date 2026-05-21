import { NestFactory } from '@nestjs/core';
import { PetoraBatchModule } from './petora-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(PetoraBatchModule);
  await app.listen(process.env.port ?? process.env.PORT_BATCH ?? 4001);
}
bootstrap();
