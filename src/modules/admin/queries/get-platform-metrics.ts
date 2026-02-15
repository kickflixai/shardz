import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================================
// Types
// ============================================================================

export interface PlatformMetrics {
	totalUsers: number;
	activeCreators: number;
	adminCount: number;
	publishedSeries: number;
	draftSeries: number;
	totalEpisodes: number;
	totalRevenueCents: number;
	platformFeeCents: number;
	creatorPayoutsCents: number;
	totalPurchases: number;
	pendingApplications: number;
}

interface RecentSignup {
	id: string;
	username: string | null;
	display_name: string | null;
	role: string;
	created_at: string;
}

interface RecentPurchase {
	id: string;
	amount_cents: number;
	created_at: string;
	// Supabase !inner join returns single object at runtime (typed as array by inference)
	seasons: { series: { title: string } };
}

interface RecentApplication {
	id: string;
	display_name: string;
	status: string;
	created_at: string;
}

export interface RecentActivity {
	recentSignups: RecentSignup[];
	recentPurchases: RecentPurchase[];
	recentApplications: RecentApplication[];
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Aggregate platform metrics from all tables.
 * Used by the admin dashboard for the overview metric cards.
 */
export const getPlatformMetrics = cache(async (): Promise<PlatformMetrics> => {
	const adminDb = createAdminClient();

	const [
		usersResult,
		creatorsResult,
		adminsResult,
		publishedSeriesResult,
		draftSeriesResult,
		episodesResult,
		purchasesResult,
		applicationsResult,
	] = await Promise.all([
		adminDb.from("profiles").select("id", { count: "exact", head: true }),
		adminDb.from("profiles").select("id", { count: "exact", head: true }).eq("role", "creator"),
		adminDb.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
		adminDb.from("series").select("id", { count: "exact", head: true }).eq("status", "published"),
		adminDb.from("series").select("id", { count: "exact", head: true }).eq("status", "draft"),
		adminDb.from("episodes").select("id", { count: "exact", head: true }),
		adminDb
			.from("purchases")
			.select("amount_cents, creator_share_cents, platform_fee_cents")
			.eq("status", "completed"),
		adminDb
			.from("creator_applications")
			.select("id", { count: "exact", head: true })
			.eq("status", "pending"),
	]);

	const purchases = purchasesResult.data ?? [];
	const totalRevenueCents = purchases.reduce((sum, p) => sum + p.amount_cents, 0);
	const platformFeeCents = purchases.reduce((sum, p) => sum + p.platform_fee_cents, 0);
	const creatorPayoutsCents = purchases.reduce((sum, p) => sum + p.creator_share_cents, 0);

	return {
		totalUsers: usersResult.count ?? 0,
		activeCreators: creatorsResult.count ?? 0,
		adminCount: adminsResult.count ?? 0,
		publishedSeries: publishedSeriesResult.count ?? 0,
		draftSeries: draftSeriesResult.count ?? 0,
		totalEpisodes: episodesResult.count ?? 0,
		totalRevenueCents,
		platformFeeCents,
		creatorPayoutsCents,
		totalPurchases: purchases.length,
		pendingApplications: applicationsResult.count ?? 0,
	};
});

/**
 * Recent activity feeds for the admin dashboard.
 * Returns the latest signups, purchases, and applications.
 */
export const getRecentActivity = cache(async (): Promise<RecentActivity> => {
	const adminDb = createAdminClient();

	const [signupsResult, purchasesResult, applicationsResult] = await Promise.all([
		adminDb
			.from("profiles")
			.select("id, username, display_name, role, created_at")
			.order("created_at", { ascending: false })
			.limit(5),
		adminDb
			.from("purchases")
			.select("id, amount_cents, created_at, seasons!inner(series!inner(title))")
			.eq("status", "completed")
			.order("created_at", { ascending: false })
			.limit(5),
		adminDb
			.from("creator_applications")
			.select("id, display_name, status, created_at")
			.order("created_at", { ascending: false })
			.limit(5),
	]);

	return {
		recentSignups: (signupsResult.data ?? []) as RecentSignup[],
		recentPurchases: (purchasesResult.data ?? []) as unknown as RecentPurchase[],
		recentApplications: (applicationsResult.data ?? []) as RecentApplication[],
	};
});
