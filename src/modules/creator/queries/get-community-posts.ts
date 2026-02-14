import { createClient } from "@/lib/supabase/server";

export interface CommunityPostAuthor {
	display_name: string | null;
	avatar_url: string | null;
}

export interface CommunityPostWithAuthor {
	id: string;
	series_id: string;
	author_id: string;
	content: string;
	post_type: "discussion" | "poll" | "announcement";
	poll_options: Array<{ text: string; votes: number }> | null;
	is_pinned: boolean;
	created_at: string;
	updated_at: string;
	author: CommunityPostAuthor;
}

/**
 * Fetch community posts for a series with author info.
 * Ordered by is_pinned (pinned first), then created_at descending.
 */
export async function getCommunityPosts(
	seriesId: string,
	limit = 50,
): Promise<CommunityPostWithAuthor[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("community_posts")
		.select(
			`
			id,
			series_id,
			author_id,
			content,
			post_type,
			poll_options,
			is_pinned,
			created_at,
			updated_at,
			profiles!inner(display_name, avatar_url)
		`,
		)
		.eq("series_id", seriesId)
		.order("is_pinned", { ascending: false })
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error || !data) {
		console.error("[get-community-posts] Error:", error);
		return [];
	}

	return data.map((row) => {
		const profile = row.profiles as unknown as CommunityPostAuthor;
		return {
			id: row.id,
			series_id: row.series_id,
			author_id: row.author_id,
			content: row.content,
			post_type: row.post_type as "discussion" | "poll" | "announcement",
			poll_options: row.poll_options as Array<{
				text: string;
				votes: number;
			}> | null,
			is_pinned: row.is_pinned,
			created_at: row.created_at,
			updated_at: row.updated_at,
			author: {
				display_name: profile.display_name,
				avatar_url: profile.avatar_url,
			},
		};
	});
}
