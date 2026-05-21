import { NestFactory } from '@nestjs/core';
import { PetoraBatchModule } from './petora-batch.module';

async function bootstrap() {
	const app = await NestFactory.create(PetoraBatchModule);
	await app.listen(process.env.port ?? process.env.PORT_BATCH ?? 4001);
	console.log(`Petora-Batch server is running in PORT: "http://localhost:${process.env.PORT_BATCH}"`);
}
bootstrap();
