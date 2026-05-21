import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(process.env.PORT ?? process.env.PORT_API ?? 4000);
	console.log(`Petora-API servier is running in PORT: "http://localhost:${process.env.PORT_API}"`);
}
bootstrap();
