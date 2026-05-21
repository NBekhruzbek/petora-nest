import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ServiceModule } from './service/service.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [MemberModule, ServiceModule, ProductModule]
})
export class ComponentsModule {}
