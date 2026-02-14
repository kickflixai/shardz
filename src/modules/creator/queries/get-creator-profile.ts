import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface CreatorProfileSeries {
	id: string;
	slug: string;
	title: string;
	genre: string;
	thumbnail_url: string | null;
	view_count: number;
	seasons: Array<{
		id: string;
		season_number: number;
		title: string | null;
		episodes: Array<{ id: string }>;
	}>;
}

export interface CreatorProfileData {
	id: string;
	username: string;
	display_name: string | null;
	avatar_url: string | null;
	bio: string | null;
	social_links: Record<string, string>;
	follower_count: number;
	role: string;
	series: CreatorProfileSeries[];
}

export const getCreatorProfile = cache(
	async (username: string): Promise<CreatorProfileData | null> => {
		const supabase = await createClient();

		// Get creator profile
		const { data: profile } = await supabase
			.from("profiles")
			.select(
				"id, username, display_name, avatar_url, bio, social_links, follower_count, role",
			)
			.eq("username", username)
			.eq("role", "creator")
			.single();

		if (!profile) return null;

		// Get creator's published series with nested seasons and episodes
		const { data: series } = await supabase
			.from("series")
			.select(
				`
			id, slug, title, genre, thumbnail_url, view_count,
			seasons(id, season_number, title, episodes(id))
		`,
			)
			.eq("creator_id", profile.id)
			.eq("status", "published")
			.order("created_at", { ascending: false });

		return {
			...profile,
			social_links: (profile.social_links as Record<string, string>) ?? {},
			series: (series as CreatorProfileSeries[]) ?? [],
		};
	},
);

export const isFollowing = cache(
	async (userId: string, creatorId: string): Promise<boolean> => {
		const supabase = await createClient();

		const { data } = await supabase
			.from("followers")
			.select("id")
			.eq("follower_id", userId)
			.eq("creator_id", creatorId)
			.maybeSingle();

		return !!data;
	},
);
