import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface FavoriteWithSeries {
	id: string;
	series_id: string;
	created_at: string;
	series: {
		title: string;
		slug: string;
		thumbnail_url: string | null;
		genre: string;
	};
	creator: {
		display_name: string | null;
	};
}

export const getUserFavorites = cache(
	async (userId: string): Promise<FavoriteWithSeries[]> => {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("favorites")
			.select(
				`
				id,
				series_id,
				created_at,
				series!inner(title, slug, thumbnail_url, genre, creator_id, profiles!inner(display_name))
			`,
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error || !data) {
			console.error("[get-user-favorites] Error:", error);
			return [];
		}

		return data.map((row) => {
			const series = row.series as unknown as {
				title: string;
				slug: string;
				thumbnail_url: string | null;
				genre: string;
				profiles: { display_name: string | null };
			};
			return {
				id: row.id,
				series_id: row.series_id,
				created_at: row.created_at,
				series: {
					title: series.title,
					slug: series.slug,
					thumbnail_url: series.thumbnail_url,
					genre: series.genre,
				},
				creator: {
					display_name: series.profiles.display_name,
				},
			};
		});
	},
);
