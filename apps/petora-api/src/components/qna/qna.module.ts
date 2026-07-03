import { Module } from '@nestjs/common';
import { QnaResolver } from './qna.resolver';
import { QnaService } from './qna.service';
import { MongooseModule } from '@nestjs/mongoose';
import QnaSchema from '../../schemas/QNA.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'QNA',
				schema: QnaSchema,
			},
		]),
		AuthModule,
		MemberModule,
		ViewModule,
		LikeModule,
	],
	providers: [QnaResolver, QnaService],
	exports: [QnaService],
})
export class QnaModule {}
