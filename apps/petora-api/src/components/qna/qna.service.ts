import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ViewService } from '../view/view.service';

@Injectable()
export class QnaService {
	constructor(
		@InjectModel('BoardArticle') private readonly boardArticleModel: Model<null>,
		private readonly viewService: ViewService,
	) {}
}
