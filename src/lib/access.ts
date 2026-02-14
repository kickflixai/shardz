export type EpisodeAccessResult =
	| { allowed: true; reason: "free" }
	| { allowed: true; reason: "purchased" }
	| { allowed: false; reason: "auth_required" }
	| { allowed: false; reason: "payment_required" };

export const FREE_EPISODE_LIMIT = 3;

export function checkEpisodeAccess(
	episodeNumber: number,
	user: { id: string } | null,
	hasPurchased?: boolean,
): EpisodeAccessResult {
	// First 3 episodes are always free -- no auth, no payment
	if (episodeNumber <= FREE_EPISODE_LIMIT) {
		return { allowed: true, reason: "free" };
	}

	// Episodes 4+ require authentication
	if (!user) {
		return { allowed: false, reason: "auth_required" };
	}

	// Payment check -- deferred to Phase 5
	// For now, all authenticated users are blocked from 4+ (no payment system yet)
	if (hasPurchased) {
		return { allowed: true, reason: "purchased" };
	}

	return { allowed: false, reason: "payment_required" };
}
