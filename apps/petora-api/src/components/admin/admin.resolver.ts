import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { AdminDashboardStats } from '../../libs/dto/admin/admin';

@Resolver()
export class AdminResolver {
	constructor(private readonly adminService: AdminService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => AdminDashboardStats)
	public async getAdminDashboardStats(): Promise<AdminDashboardStats> {
		console.log('Query: getAdminDashboardStats');
		return await this.adminService.getAdminDashboardStats();
	}
}
