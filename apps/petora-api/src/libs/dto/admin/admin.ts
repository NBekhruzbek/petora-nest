import { Field, Int, ObjectType } from '@nestjs/graphql';

/**
 * Totals for the admin dashboard cards.
 *
 * Every figure here spans the whole collection, which is why it cannot be
 * derived from the paged `getAll*ByAdmin` queries the rest of the panel uses.
 */
@ObjectType()
export class AdminDashboardStats {
	@Field(() => Int)
	totalUsers: number;

	@Field(() => Int)
	totalAgents: number;

	@Field(() => Int)
	totalProducts: number;

	@Field(() => Int)
	totalOrders: number;

	@Field(() => Int)
	pendingOrders: number;

	/** Sum of `orderTotal` over every order that was not cancelled. */
	@Field(() => Number)
	totalRevenue: number;
}
