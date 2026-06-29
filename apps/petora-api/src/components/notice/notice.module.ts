import { Module } from '@nestjs/common';
import { NoticeResolver } from './notice.resolver';
import { NoticeService } from './notice.service';
import { MongooseModule } from '@nestjs/mongoose';
import NoticeSchema from '../../schemas/Notice.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Notice',
				schema: NoticeSchema,
			},
		]),
		AuthModule,
		ViewModule,
	],
	providers: [NoticeResolver, NoticeService],
})
export class NoticeModule {}
