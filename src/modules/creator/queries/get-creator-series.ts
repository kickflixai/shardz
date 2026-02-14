import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface CreatorSeriesItem {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	genre: string;
	thumbnail_url: string | null;
	status: string;
	created_at: string;
	season_count: number;
	episode_count: number;
}

/**
 * Get all series for a creator with season and episode counts.
 *
 * Returns series ordered by created_at desc.
 * Wrapped in React.cache for request-level deduplication.
 */
export const getCreatorSeries = cache(
	async (creatorId: string): Promise<CreatorSeriesItem[]> => {
		const supabase = await createClient();

		const { data: seriesData } = await supabase
			.from("series")
			.select(
				`
				id, slug, title, description, genre, thumbnail_url, status, created_at,
				seasons(id, episodes(id))
			`,
			)
			.eq("creator_id", creatorId)
			.order("created_at", { ascending: false });

		if (!seriesData) return [];

		return seriesData.map((s) => {
			const seasons = s.seasons ?? [];
			const episodeCount = seasons.reduce(
				(sum: number, season: { episodes: { id: string }[] }) =>
					sum + (season.episodes?.length ?? 0),
				0,
			);

			return {
				id: s.id,
				slug: s.slug,
				title: s.title,
				description: s.description,
				genre: s.genre,
				thumbnail_url: s.thumbnail_url,
				status: s.status,
				created_at: s.created_at,
				season_count: seasons.length,
				episode_count: episodeCount,
			};
		});
	},
);
