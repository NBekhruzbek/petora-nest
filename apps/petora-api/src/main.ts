import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	await app.listen(process.env.PORT ?? process.env.PORT_API ?? 4000);
	console.log(`Petora-API servier is running in PORT: "http://localhost:${process.env.PORT_API}"`);
}
bootstrap();
