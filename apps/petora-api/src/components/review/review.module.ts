import { Module } from '@nestjs/common';
import { ReviewResolver } from './review.resolver';
import { ReviewService } from './review.service';
import { MongooseModule } from '@nestjs/mongoose';
import ReviewSchema from '../../schemas/Review.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { ServiceModule } from '../service/service.module';
import { ProductModule } from '../product/product.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Review',
				schema: ReviewSchema,
			},
		]),
		AuthModule,
		MemberModule,
		ServiceModule,
		ProductModule,
	],
	providers: [ReviewResolver, ReviewService],
})
export class ReviewModule {}
