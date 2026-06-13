import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import BillingSchema from '../../schemas/Billing.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Member',
				schema: MemberSchema,
			},
			{
				name: 'Billing',
				schema: BillingSchema,
			},
		]),
		AuthModule,
		ViewModule,
	],
	providers: [MemberResolver, MemberService],
	exports: [MemberService],
})
export class MemberModule {}
