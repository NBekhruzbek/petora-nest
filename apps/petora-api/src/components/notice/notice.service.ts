import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/view.service';
import { Model } from 'mongoose';

@Injectable()
export class NoticeService {
	constructor(
		@InjectModel('FAQ') private readonly noticeModel: Model<null>,
		private readonly viewService: ViewService,
	) {}
}
