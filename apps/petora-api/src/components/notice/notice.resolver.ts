import { Resolver } from '@nestjs/graphql';
import { NoticeService } from './notice.service';

@Resolver()
export class NoticeResolver {
	constructor(private readonly noticeService: NoticeService) {}
}
