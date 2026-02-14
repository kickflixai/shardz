import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getSeriesBySlug = cache(async (slug: string) => {
	const supabase = await createClient();

	const { data } = await supabase
		.from("series")
		.select(
			`
			*,
			profiles!inner (
				id, display_name, username, avatar_url, bio
			),
			seasons (
				*,
				episodes (
					id, episode_number, title, description,
					duration_seconds, thumbnail_url, status
				)
			)
		`,
		)
		.eq("slug", slug)
		.eq("status", "published")
		.order("season_number", { referencedTable: "seasons", ascending: true })
		.order("episode_number", {
			referencedTable: "seasons.episodes",
			ascending: true,
		})
		.single();

	return data;
});
