import { Module } from '@nestjs/common';
import { FaqResolver } from './faq.resolver';
import { FaqService } from './faq.service';
import { MongooseModule } from '@nestjs/mongoose';
import FaqSchema from '../../schemas/FAQ.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'FAQ',
				schema: FaqSchema,
			},
		]),
		AuthModule,
		ViewModule,
	],
	providers: [FaqResolver, FaqService],
})
export class FaqModule {}
