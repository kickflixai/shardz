import { createClient } from "@/lib/supabase/server";

/**
 * Check if a user has purchased a specific season.
 * Uses the cookie-based server client (runs in authenticated user context).
 */
export async function hasUserPurchasedSeason(
	userId: string,
	seasonId: string,
): Promise<boolean> {
	const supabase = await createClient();
	const { data } = await supabase
		.from("purchases")
		.select("id")
		.eq("user_id", userId)
		.eq("season_id", seasonId)
		.eq("status", "completed")
		.limit(1)
		.single();

	return !!data;
}

/**
 * Get the set of season IDs that a user has purchased from a given list.
 * Useful for efficiently checking multiple seasons at once (e.g., series page).
 * Uses the cookie-based server client (runs in authenticated user context).
 */
export async function getUserSeasonPurchases(
	userId: string,
	seasonIds: string[],
): Promise<Set<string>> {
	if (seasonIds.length === 0) {
		return new Set();
	}

	const supabase = await createClient();
	const { data } = await supabase
		.from("purchases")
		.select("season_id")
		.eq("user_id", userId)
		.eq("status", "completed")
		.in("season_id", seasonIds);

	return new Set((data ?? []).map((p) => p.season_id));
}
