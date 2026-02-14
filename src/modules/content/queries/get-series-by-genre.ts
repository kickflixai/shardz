import { createClient } from "@/lib/supabase/server";
import type { Genre } from "@/db/types";
import type { SeriesWithCreator } from "@/modules/content/types";

/**
 * Fetch published series, optionally filtered by genre.
 * Returns series with creator display name and total episode count.
 */
export async function getSeriesByGenre(
	genre?: string,
): Promise<SeriesWithCreator[]> {
	const supabase = await createClient();

	let query = supabase
		.from("series")
		.select(
			`
			id, slug, title, genre, thumbnail_url, view_count, status,
			profiles!inner ( display_name ),
			seasons ( id, episodes ( id ) )
		`,
		)
		.eq("status", "published")
		.order("created_at", { ascending: false });

	if (genre && genre !== "all") {
		query = query.eq("genre", genre as Genre);
	}

	const { data, error } = await query;

	if (error || !data) {
		return [];
	}

	return data.map((row) => {
		// Flatten nested seasons -> episodes to get total episode count
		const episodeCount = (row.seasons as { id: string; episodes: { id: string }[] }[]).reduce(
			(total, season) => total + (season.episodes?.length ?? 0),
			0,
		);

		// profiles is returned as an object (inner join on single creator)
		const profile = row.profiles as unknown as { display_name: string | null };

		return {
			id: row.id,
			slug: row.slug,
			title: row.title,
			genre: row.genre as Genre,
			thumbnail_url: row.thumbnail_url,
			view_count: row.view_count,
			status: row.status,
			creator: {
				display_name: profile?.display_name ?? "Unknown Creator",
			},
			episode_count: episodeCount,
		} satisfies SeriesWithCreator;
	});
}
