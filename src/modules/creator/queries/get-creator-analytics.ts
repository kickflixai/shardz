import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// Types
// ============================================================================

interface SeriesAnalytics {
	seriesId: string;
	title: string;
	slug: string;
	thumbnailUrl: string | null;
	views: number;
	unlocks: number;
	revenueCents: number;
}

interface RecentPurchase {
	id: string;
	amountCents: number;
	creatorShareCents: number;
	createdAt: string;
	seriesTitle: string;
}

interface CreatorAnalytics {
	totalViews: number;
	totalRevenueCents: number;
	creatorEarningsCents: number;
	totalUnlocks: number;
	pendingEarningsCents: number;
	transferredEarningsCents: number;
	seriesBreakdown: SeriesAnalytics[];
	recentPurchases: RecentPurchase[];
}

interface CreatorOverview {
	totalViews: number;
	totalEarningsCents: number;
	totalUnlocks: number;
	seriesCount: number;
	recentPurchases: RecentPurchase[];
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Full analytics data for the creator analytics dashboard page.
 * Aggregates views from series.view_count and revenue from purchases table.
 */
export const getCreatorAnalytics = cache(
	async (creatorId: string): Promise<CreatorAnalytics> => {
		const supabase = await createClient();

		// Fetch all creator's series
		const { data: seriesData } = await supabase
			.from("series")
			.select("id, title, slug, view_count, thumbnail_url, status")
			.eq("creator_id", creatorId);

		// Fetch all completed purchases for this creator
		const { data: purchaseData } = await supabase
			.from("purchases")
			.select("id, amount_cents, creator_share_cents, transferred, created_at, season_id")
			.eq("creator_id", creatorId)
			.eq("status", "completed")
			.order("created_at", { ascending: false });

		// Fetch seasons to map season_id -> series_id
		const { data: seasonsData } = await supabase
			.from("seasons")
			.select("id, series_id, series!inner(title)")
			.in(
				"series_id",
				(seriesData ?? []).map((s) => s.id),
			);

		const series = seriesData ?? [];
		const purchases = purchaseData ?? [];
		const seasons = seasonsData ?? [];

		// Build season -> series mapping
		const seasonToSeries = new Map<string, string>();
		for (const season of seasons) {
			seasonToSeries.set(season.id, season.series_id);
		}

		// Compute aggregate metrics
		const totalViews = series.reduce((sum, s) => sum + (s.view_count ?? 0), 0);
		const totalRevenueCents = purchases.reduce(
			(sum, p) => sum + p.amount_cents,
			0,
		);
		const creatorEarningsCents = purchases.reduce(
			(sum, p) => sum + p.creator_share_cents,
			0,
		);
		const totalUnlocks = purchases.length;
		const pendingEarningsCents = purchases
			.filter((p) => !p.transferred)
			.reduce((sum, p) => sum + p.creator_share_cents, 0);
		const transferredEarningsCents = purchases
			.filter((p) => p.transferred)
			.reduce((sum, p) => sum + p.creator_share_cents, 0);

		// Per-series breakdown
		const seriesMap = new Map<
			string,
			{ unlocks: number; revenueCents: number }
		>();
		for (const purchase of purchases) {
			const seriesId = seasonToSeries.get(purchase.season_id);
			if (!seriesId) continue;
			const existing = seriesMap.get(seriesId) ?? {
				unlocks: 0,
				revenueCents: 0,
			};
			existing.unlocks += 1;
			existing.revenueCents += purchase.amount_cents;
			seriesMap.set(seriesId, existing);
		}

		const seriesBreakdown: SeriesAnalytics[] = series
			.map((s) => {
				const stats = seriesMap.get(s.id) ?? { unlocks: 0, revenueCents: 0 };
				return {
					seriesId: s.id,
					title: s.title,
					slug: s.slug,
					thumbnailUrl: s.thumbnail_url,
					views: s.view_count ?? 0,
					unlocks: stats.unlocks,
					revenueCents: stats.revenueCents,
				};
			})
			.sort((a, b) => b.revenueCents - a.revenueCents);

		// Build season -> series title mapping for recent purchases
		const seasonToSeriesTitle = new Map<string, string>();
		for (const season of seasons) {
			const seriesTitle = (season.series as unknown as { title: string })
				?.title;
			if (seriesTitle) {
				seasonToSeriesTitle.set(season.id, seriesTitle);
			}
		}

		// Recent purchases (last 20)
		const recentPurchases: RecentPurchase[] = purchases
			.slice(0, 20)
			.map((p) => ({
				id: p.id,
				amountCents: p.amount_cents,
				creatorShareCents: p.creator_share_cents,
				createdAt: p.created_at,
				seriesTitle: seasonToSeriesTitle.get(p.season_id) ?? "Unknown Series",
			}));

		return {
			totalViews,
			totalRevenueCents,
			creatorEarningsCents,
			totalUnlocks,
			pendingEarningsCents,
			transferredEarningsCents,
			seriesBreakdown,
			recentPurchases,
		};
	},
);

/**
 * Lightweight overview for the dashboard home page.
 * Returns just the key stats and a few recent purchases.
 */
export const getCreatorOverview = cache(
	async (creatorId: string): Promise<CreatorOverview> => {
		const supabase = await createClient();

		// Fetch series count and total views
		const { data: seriesData } = await supabase
			.from("series")
			.select("id, view_count")
			.eq("creator_id", creatorId);

		// Fetch completed purchases
		const { data: purchaseData } = await supabase
			.from("purchases")
			.select("id, amount_cents, creator_share_cents, created_at, season_id")
			.eq("creator_id", creatorId)
			.eq("status", "completed")
			.order("created_at", { ascending: false })
			.limit(5);

		const series = seriesData ?? [];
		const purchases = purchaseData ?? [];

		const totalViews = series.reduce((sum, s) => sum + (s.view_count ?? 0), 0);

		// For total earnings, we need all purchases (not just last 5)
		const { data: allPurchases } = await supabase
			.from("purchases")
			.select("creator_share_cents")
			.eq("creator_id", creatorId)
			.eq("status", "completed");

		const totalEarningsCents = (allPurchases ?? []).reduce(
			(sum, p) => sum + p.creator_share_cents,
			0,
		);
		const totalUnlocks = allPurchases?.length ?? 0;

		// Get season -> series title mapping for recent purchases
		const seasonIds = [...new Set(purchases.map((p) => p.season_id))];
		const { data: seasonsData } = await supabase
			.from("seasons")
			.select("id, series!inner(title)")
			.in("id", seasonIds.length > 0 ? seasonIds : ["__none__"]);

		const seasonToSeriesTitle = new Map<string, string>();
		for (const season of seasonsData ?? []) {
			const seriesTitle = (season.series as unknown as { title: string })
				?.title;
			if (seriesTitle) {
				seasonToSeriesTitle.set(season.id, seriesTitle);
			}
		}

		const recentPurchases: RecentPurchase[] = purchases.map((p) => ({
			id: p.id,
			amountCents: p.amount_cents,
			creatorShareCents: p.creator_share_cents,
			createdAt: p.created_at,
			seriesTitle: seasonToSeriesTitle.get(p.season_id) ?? "Unknown Series",
		}));

		return {
			totalViews,
			totalEarningsCents,
			totalUnlocks,
			seriesCount: series.length,
			recentPurchases,
		};
	},
);
