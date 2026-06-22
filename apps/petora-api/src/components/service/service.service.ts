import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, Services } from '../../libs/dto/service/service';
import { ServiceInput, ServicesInquiry } from '../../libs/dto/service/service.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ServiceUpdate } from '../../libs/dto/service/service.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { T } from '../../libs/types/common';
import { ServiceStatus, ServiceType } from '../../libs/enums/service.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { MemberService } from '../member/member.service';

@Injectable()
export class ServiceService {
	constructor(
		@InjectModel('Service') private readonly serviceModel: Model<Service>,
		private viewService: ViewService,
		private memberService: MemberService,
	) {}

	public async createService(memberId: Types.ObjectId, input: ServiceInput): Promise<Service> {
		input.memberId = memberId;

		try {
			const result: Service = await this.serviceModel.create(input);

			if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

			await this.memberService.updateAgentServices(memberId, 1);

			return result;
		} catch (err) {
			console.log('Error, Service.model:', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	public async updateService(memberId: Types.ObjectId, input: ServiceUpdate): Promise<Service> {
		try {
			input.serviceId = shapeIntoMongoObjectId(input.serviceId);
			const { serviceId, ...updateFields } = input;

			const result: Service = await this.serviceModel
				.findOneAndUpdate(
					{
						_id: serviceId,
						memberId: memberId,
					},
					{ $set: updateFields },
					{ new: true },
				)
				.exec();
			if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

			return result;
		} catch (err) {
			console.log('Error, Service.model:', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}
	}

	public async updateServiceByAdmin(input: ServiceUpdate): Promise<Service> {
		try {
			input.serviceId = shapeIntoMongoObjectId(input.serviceId);
			const { serviceId, ...updateFields } = input;

			const result: Service = await this.serviceModel
				.findOneAndUpdate(
					{
						_id: serviceId,
					},
					{ $set: updateFields },
					{ new: true },
				)
				.exec();
			if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

			return result;
		} catch (err) {
			console.log('Error, Service.model:', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}
	}

	public async getService(viewerId: Types.ObjectId, targetId: Types.ObjectId): Promise<Service> {
		try {
			const search: T = {
				_id: targetId,
				serviceStatus: {
					$in: [ServiceStatus.ACTIVE, ServiceStatus.PAUSE],
				},
			};
			const targetService: Service = await this.serviceModel.findOne(search).lean().exec();
			if (!targetService) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

			if (viewerId) {
				const viewInput: ViewInput = {
					memberId: viewerId,
					viewRefId: targetId,
					viewGroup: ViewGroup.SERVICE,
				};
				const newView = await this.viewService.recordView(viewInput);

				if (newView) {
					await this.serviceModel.findOneAndUpdate(search, { $inc: { serviceViews: 1 } }, { new: true }).exec();
					targetService.serviceViews++;
				}
			}

			//TODO: meLiked?

			return targetService;
		} catch (err) {
			console.log('Error, Service.model:', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}
	}

	public async getAllServices(_id: string, input: ServicesInquiry): Promise<Services> {
		const memberId = shapeIntoMongoObjectId(_id);
		const match: T = { serviceStatus: ServiceStatus.ACTIVE };
		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);

		const result = await this.serviceModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result[0].list.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	private shapeMatchQuery(match: T, input: ServicesInquiry): void {
		const { serviceType, serviceLocation, text, priceRange } = input.search;
		if (serviceType && serviceType.length) match.serviceType = { $in: serviceType };
		if (serviceLocation && serviceLocation.length) match.serviceLocation = { $in: serviceLocation };
		if (text) match.serviceTitle = { $regex: new RegExp(text, 'i') };

		if (priceRange) {
			match.servicePrice = {};
			if (priceRange.min !== undefined) match.servicePrice.$gte = priceRange.min;
			if (priceRange.max !== undefined) match.servicePrice.$lte = priceRange.max;
		}
	}

	public async getRelatedServices(input: string): Promise<Service[]> {
		const serviceId = shapeIntoMongoObjectId(input);
		const search: T = {
			_id: serviceId,
			serviceStatus: {
				$in: [ServiceStatus.ACTIVE, ServiceStatus.PAUSE],
			},
		};
		const targetService: Service = await this.serviceModel.findOne(search).exec();
		if (!targetService) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return this.serviceModel
			.find({
				_id: { $ne: serviceId },
				serviceType: targetService.serviceType,
				serviceStatus: ServiceStatus.ACTIVE,
			})
			.sort({ serviceLikes: -1 })
			.limit(5)
			.lean()
			.exec();
	}

	public async updateServiceBookingTimes(serviceId: Types.ObjectId, updatingNumber: number): Promise<Service> {
		return await this.serviceModel
			.findOneAndUpdate({ _id: serviceId }, { $inc: { serviceBookings: updatingNumber } }, { new: true })
			.exec();
	}
}
