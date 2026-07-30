import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ServiceModule } from './service/service.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { ReviewModule } from './review/review.module';
import { OrderModule } from './order/order.module';
import { BookingModule } from './booking/booking.module';
import { QnaModule } from './qna/qna.module';
import { FaqModule } from './faq/faq.module';
import { NoticeModule } from './notice/notice.module';
import { NotificationModule } from './notification/notification.module';
import { AdminModule } from './admin/admin.module';

@Module({
	imports: [
		MemberModule,
		AuthModule,
		ProductModule,
		ServiceModule,
		BoardArticleModule,
		ReviewModule,
		CommentModule,
		LikeModule,
		ViewModule,
		OrderModule,
		BookingModule,
		QnaModule,
		FaqModule,
		NoticeModule,
		NotificationModule,
		AdminModule,
	],
})
export class ComponentsModule {}
