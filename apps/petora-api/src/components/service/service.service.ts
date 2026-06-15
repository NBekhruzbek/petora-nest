import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service } from '../../libs/dto/service/service';
import { ServiceInput } from '../../libs/dto/service/service.input';
import { Message } from '../../libs/enums/common.enum';
import { ServiceUpdate } from '../../libs/dto/service/service.update';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class ServiceService {
	constructor(@InjectModel('Service') private readonly serviceModel: Model<Service>) {}

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
}
