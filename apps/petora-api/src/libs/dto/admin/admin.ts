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

	@Field(() => Int)
	totalBookings: number;

	@Field(() => Int)
	pendingBookings: number;

	/**
	 * Both halves of the marketplace: every order that was not cancelled, plus
	 * every booking the customer has actually paid for.
	 */
	@Field(() => Number)
	totalRevenue: number;
}
