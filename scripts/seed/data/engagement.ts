/**
 * Engagement data generation functions for seeding Shardz.
 *
 * Produces realistic view counts, purchase estimates, and follower counts
 * for an early-stage platform where the hero series drives the most traffic.
 *
 * All functions are pure -- no database calls, no side effects.
 * Consumed by the seed execution script (08-02).
 */

/**
 * Deterministic pseudo-random number generator using a seed string.
 * Produces consistent results across runs for idempotent seeding.
 */
function seededRandom(seed: string): () => number {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = ((hash << 5) - hash + char) | 0;
	}
	return () => {
		hash = ((hash << 13) ^ hash) | 0;
		hash = (hash * 1540483477) | 0;
		hash = ((hash << 17) ^ hash) | 0;
		return (((hash < 0 ? ~hash : hash) % 10000) / 10000);
	};
}

/**
 * Generate a random integer between min and max (inclusive) using seeded random.
 */
function randomInt(rng: () => number, min: number, max: number): number {
	return Math.floor(rng() * (max - min + 1)) + min;
}

export interface SeriesEngagement {
	seriesIndex: number;
	viewCount: number;
	isHero: boolean;
}

export interface SeasonPurchases {
	seriesIndex: number;
	seasonIndex: number;
	purchaseCount: number;
}

export interface CreatorFollowers {
	creatorIndex: number;
	followerCount: number;
}

export interface EngagementData {
	seriesViews: SeriesEngagement[];
	seasonPurchases: SeasonPurchases[];
	creatorFollowers: CreatorFollowers[];
}

/**
 * Generate realistic view counts for each series.
 *
 * Ranges (designed for an early-stage platform):
 * - Hero series: 2,000-5,000 views
 * - Popular series (thrillers, action): 800-2,000 views
 * - Mid-tier series: 300-800 views
 * - Newer/niche series: 100-400 views
 */
export function generateViewCounts(
	seriesData: Array<{ genre: string; isHeroSeries: boolean }>,
): SeriesEngagement[] {
	const rng = seededRandom("shardz-views-v1");

	const popularGenres = new Set(["thriller", "action", "sci-fi", "horror"]);

	return seriesData.map((series, index) => {
		let viewCount: number;

		if (series.isHeroSeries) {
			viewCount = randomInt(rng, 2000, 5000);
		} else if (popularGenres.has(series.genre)) {
			viewCount = randomInt(rng, 800, 2000);
		} else if (["drama", "comedy", "romance"].includes(series.genre)) {
			viewCount = randomInt(rng, 300, 800);
		} else {
			viewCount = randomInt(rng, 100, 400);
		}

		return {
			seriesIndex: index,
			viewCount,
			isHero: series.isHeroSeries,
		};
	});
}

/**
 * Generate purchase count estimates per season.
 *
 * Conversion rates (views -> purchases):
 * - Free content (low price): ~15-25% of views
 * - Standard price: ~8-15% of views
 * - Premium price: ~3-8% of views
 * - Hero series gets a boost
 */
export function generatePurchaseCounts(
	seriesData: Array<{ isHeroSeries: boolean; seasons: Array<{ priceCents: number }> }>,
	seriesViews: SeriesEngagement[],
): SeasonPurchases[] {
	const rng = seededRandom("shardz-purchases-v1");
	const purchases: SeasonPurchases[] = [];

	for (let si = 0; si < seriesData.length; si++) {
		const series = seriesData[si];
		const views = seriesViews[si]?.viewCount ?? 200;

		for (let sei = 0; sei < series.seasons.length; sei++) {
			const season = series.seasons[sei];
			let conversionRate: number;

			if (season.priceCents <= 199) {
				conversionRate = randomInt(rng, 15, 25) / 100;
			} else if (season.priceCents <= 399) {
				conversionRate = randomInt(rng, 8, 15) / 100;
			} else {
				conversionRate = randomInt(rng, 3, 8) / 100;
			}

			// Hero series boost
			if (series.isHeroSeries) {
				conversionRate *= 1.3;
			}

			// Later seasons have lower conversion (drop-off)
			if (sei > 0) {
				conversionRate *= 0.7;
			}

			const purchaseCount = Math.max(1, Math.round(views * conversionRate));

			purchases.push({
				seriesIndex: si,
				seasonIndex: sei,
				purchaseCount,
			});
		}
	}

	return purchases;
}

/**
 * Generate follower counts for creator profiles.
 *
 * Based on total views across their series:
 * - High-view creators: 150-500 followers
 * - Mid-view creators: 50-200 followers
 * - New creators: 20-80 followers
 */
export function generateFollowerCounts(
	creatorCount: number,
	seriesData: Array<{ creatorIndex: number }>,
	seriesViews: SeriesEngagement[],
): CreatorFollowers[] {
	const rng = seededRandom("shardz-followers-v1");

	// Aggregate views per creator
	const viewsByCreator = new Map<number, number>();
	for (const view of seriesViews) {
		const creatorIdx = seriesData[view.seriesIndex]?.creatorIndex ?? 0;
		viewsByCreator.set(
			creatorIdx,
			(viewsByCreator.get(creatorIdx) ?? 0) + view.viewCount,
		);
	}

	const followers: CreatorFollowers[] = [];

	for (let i = 0; i < creatorCount; i++) {
		const totalViews = viewsByCreator.get(i) ?? 0;
		let followerCount: number;

		if (totalViews > 3000) {
			followerCount = randomInt(rng, 150, 500);
		} else if (totalViews > 1000) {
			followerCount = randomInt(rng, 50, 200);
		} else {
			followerCount = randomInt(rng, 20, 80);
		}

		followers.push({
			creatorIndex: i,
			followerCount,
		});
	}

	return followers;
}

/**
 * Generate the full engagement dataset from series and creator data.
 *
 * This is the main entry point consumed by the seed execution script.
 */
export function generateEngagement(
	seriesData: Array<{
		genre: string;
		isHeroSeries: boolean;
		creatorIndex: number;
		seasons: Array<{ priceCents: number }>;
	}>,
	creatorCount: number,
): EngagementData {
	const seriesViews = generateViewCounts(seriesData);
	const seasonPurchases = generatePurchaseCounts(seriesData, seriesViews);
	const creatorFollowers = generateFollowerCounts(creatorCount, seriesData, seriesViews);

	return {
		seriesViews,
		seasonPurchases,
		creatorFollowers,
	};
}
