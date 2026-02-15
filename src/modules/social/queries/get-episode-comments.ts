import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface CommentWithAuthor {
	id: string;
	episode_id: string;
	user_id: string;
	content: string;
	timestamp_seconds: number;
	created_at: string;
	author: {
		display_name: string | null;
		avatar_url: string | null;
	};
}

/**
 * Fetch episode comments pre-bucketed by timestamp_seconds for O(1) lookup during playback.
 * Only returns non-flagged comments.
 */
export const getEpisodeComments = cache(
	async (episodeId: string): Promise<Map<number, CommentWithAuthor[]>> => {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("episode_comments")
			.select(
				`
				id,
				episode_id,
				user_id,
				content,
				timestamp_seconds,
				created_at,
				profiles!inner(display_name, avatar_url)
			`,
			)
			.eq("episode_id", episodeId)
			.eq("is_flagged", false)
			.order("timestamp_seconds", { ascending: true });

		if (error || !data) {
			console.error("[get-episode-comments] Error:", error);
			return new Map();
		}

		const buckets = new Map<number, CommentWithAuthor[]>();

		for (const row of data) {
			const profile = row.profiles as unknown as {
				display_name: string | null;
				avatar_url: string | null;
			};
			const comment: CommentWithAuthor = {
				id: row.id,
				episode_id: row.episode_id,
				user_id: row.user_id,
				content: row.content,
				timestamp_seconds: row.timestamp_seconds,
				created_at: row.created_at,
				author: {
					display_name: profile.display_name,
					avatar_url: profile.avatar_url,
				},
			};

			const bucket = buckets.get(row.timestamp_seconds);
			if (bucket) {
				bucket.push(comment);
			} else {
				buckets.set(row.timestamp_seconds, [comment]);
			}
		}

		return buckets;
	},
);
