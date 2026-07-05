import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MemberService } from '../member/member.service';
import { ServiceService } from '../service/service.service';
import { ProductService } from '../product/product.service';
import { Model } from 'mongoose';

@Injectable()
export class ReviewService {
	constructor(
		@InjectModel('Review') private readonly reviewModel: Model<null>,
		private readonly memberService: MemberService,
		private readonly serviceService: ServiceService,
		private readonly productService: ProductService,
	) {}
}
