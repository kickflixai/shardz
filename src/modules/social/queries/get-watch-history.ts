import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface WatchHistoryWithEpisode {
	id: string;
	episode_id: string;
	progress_seconds: number;
	completed: boolean;
	last_watched_at: string;
	episode: {
		title: string;
		episode_number: number;
	};
	series: {
		title: string;
		slug: string;
		thumbnail_url: string | null;
	};
}

export const getWatchHistory = cache(
	async (userId: string): Promise<WatchHistoryWithEpisode[]> => {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("watch_history")
			.select(
				`
				id,
				episode_id,
				progress_seconds,
				completed,
				last_watched_at,
				episodes!inner(title, episode_number, seasons!inner(series!inner(title, slug, thumbnail_url)))
			`,
			)
			.eq("user_id", userId)
			.order("last_watched_at", { ascending: false });

		if (error || !data) {
			console.error("[get-watch-history] Error:", error);
			return [];
		}

		return data.map((row) => {
			const episode = row.episodes as unknown as {
				title: string;
				episode_number: number;
				seasons: {
					series: {
						title: string;
						slug: string;
						thumbnail_url: string | null;
					};
				};
			};
			return {
				id: row.id,
				episode_id: row.episode_id,
				progress_seconds: row.progress_seconds,
				completed: row.completed,
				last_watched_at: row.last_watched_at,
				episode: {
					title: episode.title,
					episode_number: episode.episode_number,
				},
				series: {
					title: episode.seasons.series.title,
					slug: episode.seasons.series.slug,
					thumbnail_url: episode.seasons.series.thumbnail_url,
				},
			};
		});
	},
);
