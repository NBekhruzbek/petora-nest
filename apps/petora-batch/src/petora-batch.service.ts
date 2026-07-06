import { MemberStatus, MemberType } from '../../petora-api/src/libs/enums/member.enum';
import { ProductStatus } from '../../petora-api/src/libs/enums/product.enum';
import { ServiceStatus } from '../../petora-api/src/libs/enums/service.enum';
import { Product } from '../../petora-api/src/libs/dto/product/product';
import { Service } from '../../petora-api/src/libs/dto/service/service';
import { Member } from '../../petora-api/src/libs/dto/member/member';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class PetoraBatchService {
	constructor(
		@InjectModel('Product') private readonly productModel: Model<Product>,
		@InjectModel('Service') private readonly serviceModel: Model<Service>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.productModel
			.updateMany(
				{
					productStatus: ProductStatus.ACTIVE,
				},
				{
					productRank: 0,
				},
			)
			.exec();

		await this.serviceModel
			.updateMany(
				{
					serviceStatus: ServiceStatus.ACTIVE,
				},
				{
					serviceRank: 0,
				},
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.AGENT,
				},
				{
					memberRank: 0,
				},
			)
			.exec();
	}

	public async batchTopProducts(): Promise<void> {
		const products: Product[] = await this.productModel
			.find({
				productStatus: ProductStatus.ACTIVE,
				productRank: 0,
			})
			.exec();

		const promisedList = products.map(async (ele: Product) => {
			const { _id, productRating, productLikes, productViews } = ele;
			const rank = productRating * 10 + productLikes * 2 + productViews * 1;
			return await this.productModel.findByIdAndUpdate(_id, { productRank: rank });
		});
		await Promise.all(promisedList);
	}

	public async batchTopServices(): Promise<void> {
		const services: Service[] = await this.serviceModel
			.find({
				serviceStatus: ServiceStatus.ACTIVE,
				serviceRank: 0,
			})
			.exec();

		const promisedList = services.map(async (ele: Service) => {
			const { _id, serviceRating, serviceLikes, serviceViews } = ele;
			const rank = serviceRating * 10 + serviceLikes * 2 + serviceViews * 1;
			return await this.serviceModel.findByIdAndUpdate(_id, { serviceRank: rank });
		});
		await Promise.all(promisedList);
	}

	public async batchTopAgents(): Promise<void> {
		const agents: Member[] = await this.memberModel
			.find({
				memberType: MemberType.AGENT,
				memberStatus: MemberStatus.ACTIVE,
				memberRank: 0,
			})
			.exec();

		const promisedList = agents.map(async (ele: Member) => {
			const { _id, memberRating, memberServices, memberArticles, memberLikes, memberViews } = ele;
			const rank = memberRating * 10 + memberServices * 5 + memberArticles * 3 + memberLikes * 2 + memberViews * 1;
			return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
		});
		await Promise.all(promisedList);
	}

	getHello(): string {
		return 'Welcome to Petora BATCH Server!';
	}
}
