import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service } from '../../libs/dto/service/service';
import { ServiceInput } from '../../libs/dto/service/service.input';
import { Message } from '../../libs/enums/common.enum';
import { ServiceUpdate } from '../../libs/dto/service/service.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { T } from '../../libs/types/common';
import { ServiceStatus } from '../../libs/enums/service.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';

@Injectable()
export class ServiceService {
	constructor(
		@InjectModel('Service') private readonly serviceModel: Model<Service>,
		private viewService: ViewService,
	) {}

	public async createService(memberId: Types.ObjectId, input: ServiceInput): Promise<Service> {
		input.memberId = memberId;

		try {
			const result: Service = await this.serviceModel.create(input);

			if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

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
}
