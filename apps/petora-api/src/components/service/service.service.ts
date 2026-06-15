import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ServiceService {
	constructor(@InjectModel('Service') private readonly serviceModel: Model<null>) {}
}
