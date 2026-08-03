import { Module } from '@nestjs/common';
import { DiscoveryPetResolver } from './discovery-pet.resolver';
import { DiscoveryPetService } from './discovery-pet.service';
import { MongooseModule } from '@nestjs/mongoose';
import DiscoveryPetSchema from '../../schemas/DiscoveryPet.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'DiscoveryPet',
				schema: DiscoveryPetSchema,
			},
		]),
		AuthModule,
		ViewModule,
		LikeModule,
	],
	providers: [DiscoveryPetResolver, DiscoveryPetService],
	exports: [DiscoveryPetService],
})
export class DiscoveryPetModule {}
