import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface ReactionEntry {
	emoji: string;
	count: number;
}

/**
 * Fetch episode reactions pre-bucketed by timestamp_seconds for O(1) lookup during playback.
 * Returns a Map where each key is a timestamp and each value is an array of { emoji, count }.
 */
export const getEpisodeReactions = cache(
	async (episodeId: string): Promise<Map<number, ReactionEntry[]>> => {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("episode_reactions")
			.select("timestamp_seconds, emoji, count")
			.eq("episode_id", episodeId)
			.order("timestamp_seconds", { ascending: true });

		if (error || !data) {
			console.error("[get-episode-reactions] Error:", error);
			return new Map();
		}

		const buckets = new Map<number, ReactionEntry[]>();

		for (const row of data) {
			const entry: ReactionEntry = {
				emoji: row.emoji,
				count: row.count,
			};

			const bucket = buckets.get(row.timestamp_seconds);
			if (bucket) {
				bucket.push(entry);
			} else {
				buckets.set(row.timestamp_seconds, [entry]);
			}
		}

		return buckets;
	},
);
