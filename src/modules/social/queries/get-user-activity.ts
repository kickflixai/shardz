import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface RecentComment {
	id: string;
	content: string;
	timestamp_seconds: number;
	created_at: string;
	episode: {
		title: string;
		episode_number: number;
	};
	series: {
		title: string;
		slug: string;
	};
}

export interface FollowedCreator {
	id: string;
	creator: {
		id: string;
		display_name: string | null;
		username: string | null;
		avatar_url: string | null;
	};
	created_at: string;
}

export interface UserActivity {
	recentComments: RecentComment[];
	followedCreators: FollowedCreator[];
}

/**
 * Fetch a user's recent activity: comments and followed creators.
 * Used for the public profile/activity page.
 */
export const getUserActivity = cache(
	async (userId: string): Promise<UserActivity> => {
		const supabase = await createClient();

		// Fetch recent comments (last 20) with episode and series info
		const { data: commentsData } = await supabase
			.from("episode_comments")
			.select(
				`
				id,
				content,
				timestamp_seconds,
				created_at,
				episodes!inner(title, episode_number, seasons!inner(series!inner(title, slug)))
			`,
			)
			.eq("user_id", userId)
			.eq("is_flagged", false)
			.order("created_at", { ascending: false })
			.limit(20);

		// Fetch followed creators with profile info
		const { data: followsData } = await supabase
			.from("followers")
			.select(
				`
				id,
				created_at,
				profiles!followers_creator_id_fkey(id, display_name, username, avatar_url)
			`,
			)
			.eq("follower_id", userId)
			.order("created_at", { ascending: false });

		const recentComments: RecentComment[] = (commentsData ?? []).map(
			(row) => {
				const episode = row.episodes as unknown as {
					title: string;
					episode_number: number;
					seasons: {
						series: {
							title: string;
							slug: string;
						};
					};
				};
				return {
					id: row.id,
					content: row.content,
					timestamp_seconds: row.timestamp_seconds,
					created_at: row.created_at,
					episode: {
						title: episode.title,
						episode_number: episode.episode_number,
					},
					series: {
						title: episode.seasons.series.title,
						slug: episode.seasons.series.slug,
					},
				};
			},
		);

		const followedCreators: FollowedCreator[] = (followsData ?? []).map(
			(row) => {
				const profile = row.profiles as unknown as {
					id: string;
					display_name: string | null;
					username: string | null;
					avatar_url: string | null;
				};
				return {
					id: row.id,
					creator: {
						id: profile.id,
						display_name: profile.display_name,
						username: profile.username,
						avatar_url: profile.avatar_url,
					},
					created_at: row.created_at,
				};
			},
		);

		return { recentComments, followedCreators };
	},
);
