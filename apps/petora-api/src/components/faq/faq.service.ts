import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FaqService {
	constructor(@InjectModel('FAQ') private readonly faqModel: Model<null>) {}
}
