"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Create a discussion or announcement post in a series community.
 */
export async function createPost(
	seriesId: string,
	_prevState: { success: boolean; message?: string },
	formData: FormData,
): Promise<{ success: boolean; message?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, message: "You must be signed in" };
	}

	const content = (formData.get("content") as string)?.trim();
	if (!content || content.length < 1 || content.length > 1000) {
		return {
			success: false,
			message: "Post content must be between 1 and 1000 characters",
		};
	}

	const postType = (formData.get("postType") as string) || "discussion";
	if (!["discussion", "announcement"].includes(postType)) {
		return { success: false, message: "Invalid post type" };
	}

	// Only series creator can make announcements
	if (postType === "announcement") {
		const { data: series } = await supabase
			.from("series")
			.select("creator_id")
			.eq("id", seriesId)
			.single();

		if (!series || series.creator_id !== user.id) {
			return {
				success: false,
				message: "Only the series creator can make announcements",
			};
		}
	}

	const { error } = await supabase.from("community_posts").insert({
		series_id: seriesId,
		author_id: user.id,
		content,
		post_type: postType,
	});

	if (error) {
		return { success: false, message: "Failed to create post. Please try again." };
	}

	revalidatePath(`/dashboard/series/${seriesId}/community`);
	return { success: true };
}

/**
 * Create a poll post with multiple options (2-6).
 */
export async function createPoll(
	seriesId: string,
	_prevState: { success: boolean; message?: string },
	formData: FormData,
): Promise<{ success: boolean; message?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, message: "You must be signed in" };
	}

	const content = (formData.get("content") as string)?.trim();
	if (!content || content.length < 1 || content.length > 1000) {
		return {
			success: false,
			message: "Poll question must be between 1 and 1000 characters",
		};
	}

	// Parse poll options from formData
	const options: string[] = [];
	for (let i = 0; i < 6; i++) {
		const opt = (formData.get(`option_${i}`) as string)?.trim();
		if (opt) {
			options.push(opt);
		}
	}

	if (options.length < 2) {
		return { success: false, message: "A poll needs at least 2 options" };
	}

	if (options.length > 6) {
		return { success: false, message: "A poll can have at most 6 options" };
	}

	const pollOptions = options.map((text) => ({ text, votes: 0 }));

	const { error } = await supabase.from("community_posts").insert({
		series_id: seriesId,
		author_id: user.id,
		content,
		post_type: "poll",
		poll_options: pollOptions,
	});

	if (error) {
		return { success: false, message: "Failed to create poll. Please try again." };
	}

	revalidatePath(`/dashboard/series/${seriesId}/community`);
	return { success: true };
}

/**
 * Delete a community post.
 * Authors can delete their own posts; series creators can delete any post.
 */
export async function deletePost(
	postId: string,
): Promise<{ success: boolean; message?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, message: "You must be signed in" };
	}

	// Fetch the post to check ownership
	const { data: post } = await supabase
		.from("community_posts")
		.select("id, author_id, series_id")
		.eq("id", postId)
		.single();

	if (!post) {
		return { success: false, message: "Post not found" };
	}

	// Check: user is author OR series creator
	if (post.author_id !== user.id) {
		const { data: series } = await supabase
			.from("series")
			.select("creator_id")
			.eq("id", post.series_id)
			.single();

		if (!series || series.creator_id !== user.id) {
			return { success: false, message: "Not authorized to delete this post" };
		}
	}

	const { error } = await supabase
		.from("community_posts")
		.delete()
		.eq("id", postId);

	if (error) {
		return { success: false, message: "Failed to delete post" };
	}

	revalidatePath(`/dashboard/series/${post.series_id}/community`);
	return { success: true };
}

/**
 * Pin or unpin a community post (series creator only).
 */
export async function pinPost(
	postId: string,
	isPinned: boolean,
): Promise<{ success: boolean; message?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, message: "You must be signed in" };
	}

	// Fetch the post to get series_id
	const { data: post } = await supabase
		.from("community_posts")
		.select("id, series_id")
		.eq("id", postId)
		.single();

	if (!post) {
		return { success: false, message: "Post not found" };
	}

	// Only series creator can pin posts
	const { data: series } = await supabase
		.from("series")
		.select("creator_id")
		.eq("id", post.series_id)
		.single();

	if (!series || series.creator_id !== user.id) {
		return { success: false, message: "Only the series creator can pin posts" };
	}

	const { error } = await supabase
		.from("community_posts")
		.update({ is_pinned: isPinned })
		.eq("id", postId);

	if (error) {
		return { success: false, message: "Failed to update pin status" };
	}

	revalidatePath(`/dashboard/series/${post.series_id}/community`);
	return { success: true };
}

/**
 * Vote on a poll option. One vote per user per poll.
 * Uses ON CONFLICT (post_id, user_id) DO NOTHING for the poll_votes table,
 * and increments the vote count in the poll_options JSONB.
 */
export async function votePoll(
	postId: string,
	optionIndex: number,
): Promise<{ success: boolean; message?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, message: "You must be signed in" };
	}

	// Check that the post is a poll
	const { data: post } = await supabase
		.from("community_posts")
		.select("id, series_id, post_type, poll_options")
		.eq("id", postId)
		.single();

	if (!post || post.post_type !== "poll") {
		return { success: false, message: "This is not a poll" };
	}

	const pollOptions = post.poll_options as Array<{
		text: string;
		votes: number;
	}> | null;

	if (!pollOptions || optionIndex < 0 || optionIndex >= pollOptions.length) {
		return { success: false, message: "Invalid option" };
	}

	// Check if user already voted
	const { data: existingVote } = await supabase
		.from("poll_votes")
		.select("id")
		.eq("post_id", postId)
		.eq("user_id", user.id)
		.single();

	if (existingVote) {
		return { success: false, message: "You have already voted on this poll" };
	}

	// Insert vote
	const { error: voteError } = await supabase.from("poll_votes").insert({
		post_id: postId,
		user_id: user.id,
		option_index: optionIndex,
	});

	if (voteError) {
		// Unique constraint violation means double-vote attempt
		if (voteError.code === "23505") {
			return { success: false, message: "You have already voted on this poll" };
		}
		return { success: false, message: "Failed to vote" };
	}

	// Increment vote count in poll_options JSONB
	const updatedOptions = [...pollOptions];
	updatedOptions[optionIndex] = {
		...updatedOptions[optionIndex],
		votes: updatedOptions[optionIndex].votes + 1,
	};

	await supabase
		.from("community_posts")
		.update({ poll_options: updatedOptions })
		.eq("id", postId);

	revalidatePath(`/dashboard/series/${post.series_id}/community`);
	return { success: true };
}
