import type { ContentStatus, Genre } from "@/db/types";

/**
 * Series with creator info and episode count.
 * Matches the shape returned by Supabase queries with profile joins
 * and aggregated episode counts for browse/grid display.
 */
export interface SeriesWithCreator {
	id: string;
	slug: string;
	title: string;
	genre: Genre;
	thumbnail_url: string | null;
	view_count: number;
	status: ContentStatus;
	creator: {
		display_name: string;
	};
	episode_count: number;
}
