"use client";

import { useEffect, useState, useActionState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
	createPost,
	deletePost,
	pinPost,
	votePoll,
} from "@/modules/creator/actions/community";
import { PollCreator } from "./poll-creator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CommunityPostWithAuthor } from "@/modules/creator/queries/get-community-posts";

interface CommunityFeedProps {
	seriesId: string;
	initialPosts: CommunityPostWithAuthor[];
	currentUserId: string | null;
	isCreator: boolean;
}

function timeAgo(date: string): string {
	const seconds = Math.floor(
		(Date.now() - new Date(date).getTime()) / 1000,
	);
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function getInitials(name: string | null): string {
	if (!name) return "?";
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

const initialPostState = { success: false, message: undefined as string | undefined };

/**
 * Real-time community discussion feed.
 * Uses Supabase Realtime postgres_changes subscription to update
 * the feed live as posts are created, deleted, or updated.
 */
export function CommunityFeed({
	seriesId,
	initialPosts,
	currentUserId,
	isCreator,
}: CommunityFeedProps) {
	const [posts, setPosts] = useState<CommunityPostWithAuthor[]>(initialPosts);
	const [showPollForm, setShowPollForm] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [votingPostId, setVotingPostId] = useState<string | null>(null);

	// New post form
	const createPostBound = createPost.bind(null, seriesId);
	const [postState, postAction, isPosting] = useActionState(
		createPostBound,
		initialPostState,
	);

	// Reset form on success
	useEffect(() => {
		if (postState.success) {
			// Clear the textarea by resetting the form
			const form = document.getElementById(
				"new-post-form",
			) as HTMLFormElement | null;
			form?.reset();
		}
		if (postState.message && !postState.success) {
			toast.error(postState.message);
		}
	}, [postState]);

	// Supabase Realtime subscription
	useEffect(() => {
		const supabase = createClient();

		const channel = supabase
			.channel(`community_posts:${seriesId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "community_posts",
					filter: `series_id=eq.${seriesId}`,
				},
				async (payload) => {
					const newPost = payload.new as CommunityPostWithAuthor;

					// Fetch author info for the new post
					const { data: profile } = await supabase
						.from("profiles")
						.select("display_name, avatar_url")
						.eq("id", newPost.author_id)
						.single();

					const postWithAuthor: CommunityPostWithAuthor = {
						...newPost,
						post_type: newPost.post_type as
							| "discussion"
							| "poll"
							| "announcement",
						author: {
							display_name: profile?.display_name ?? null,
							avatar_url: profile?.avatar_url ?? null,
						},
					};

					setPosts((prev) => {
						// Avoid duplicates (in case we already got the post from revalidation)
						if (prev.some((p) => p.id === postWithAuthor.id)) {
							return prev;
						}
						return [postWithAuthor, ...prev];
					});
				},
			)
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "community_posts",
					filter: `series_id=eq.${seriesId}`,
				},
				(payload) => {
					const deletedId = (payload.old as { id: string }).id;
					setPosts((prev) => prev.filter((p) => p.id !== deletedId));
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "community_posts",
					filter: `series_id=eq.${seriesId}`,
				},
				(payload) => {
					const updated = payload.new as CommunityPostWithAuthor;
					setPosts((prev) =>
						prev.map((p) =>
							p.id === updated.id
								? {
										...p,
										is_pinned: updated.is_pinned,
										poll_options: updated.poll_options,
										content: updated.content,
									}
								: p,
						),
					);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [seriesId]);

	async function handleDelete(postId: string) {
		setDeletingId(postId);
		const result = await deletePost(postId);
		if (!result.success) {
			toast.error(result.message || "Failed to delete post");
		}
		setDeletingId(null);
	}

	async function handlePin(postId: string, currentlyPinned: boolean) {
		const result = await pinPost(postId, !currentlyPinned);
		if (!result.success) {
			toast.error(result.message || "Failed to update pin status");
		}
	}

	async function handleVote(postId: string, optionIndex: number) {
		setVotingPostId(postId);
		const result = await votePoll(postId, optionIndex);
		if (!result.success) {
			toast.error(result.message || "Failed to vote");
		}
		setVotingPostId(null);
	}

	// Check if current user already voted on a poll (we track via poll_options vote counts
	// but for client-side check we look at optimistic state; the server enforces uniqueness)

	return (
		<div className="space-y-6">
			{/* New post form */}
			{currentUserId && (
				<div className="space-y-3">
					{showPollForm ? (
						<div className="space-y-2">
							<PollCreator
								seriesId={seriesId}
								onComplete={() => setShowPollForm(false)}
							/>
							<button
								type="button"
								onClick={() => setShowPollForm(false)}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Switch to text post
							</button>
						</div>
					) : (
						<div className="space-y-2">
							<form
								id="new-post-form"
								action={postAction}
								className="space-y-3"
							>
								<input
									type="hidden"
									name="postType"
									value="discussion"
								/>
								<Textarea
									name="content"
									placeholder="Share something with the community..."
									rows={3}
									maxLength={1000}
									required
								/>
								<div className="flex items-center justify-between">
									<button
										type="button"
										onClick={() => setShowPollForm(true)}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										Create a poll instead
									</button>
									<Button
										type="submit"
										size="sm"
										disabled={isPosting}
									>
										{isPosting ? "Posting..." : "Post"}
									</Button>
								</div>
							</form>
						</div>
					)}
				</div>
			)}

			{/* Posts feed */}
			<div className="space-y-4">
				{posts.length === 0 && (
					<div className="rounded-lg border border-border bg-card p-8 text-center">
						<p className="text-muted-foreground">
							No posts yet. Be the first to start a discussion!
						</p>
					</div>
				)}

				{posts.map((post) => (
					<article
						key={post.id}
						className="rounded-lg border border-border bg-card p-4"
					>
						{/* Post header */}
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<Avatar className="size-8">
									{post.author.avatar_url && (
										<AvatarImage
											src={post.author.avatar_url}
											alt={
												post.author.display_name ||
												"User"
											}
										/>
									)}
									<AvatarFallback className="text-xs">
										{getInitials(
											post.author.display_name,
										)}
									</AvatarFallback>
								</Avatar>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-foreground">
										{post.author.display_name || "User"}
									</span>
									<span className="text-xs text-muted-foreground">
										{timeAgo(post.created_at)}
									</span>
									{post.post_type === "announcement" && (
										<Badge variant="secondary" className="text-xs">
											Announcement
										</Badge>
									)}
									{post.post_type === "poll" && (
										<Badge variant="outline" className="text-xs">
											Poll
										</Badge>
									)}
									{post.is_pinned && (
										<Badge variant="secondary" className="text-xs">
											Pinned
										</Badge>
									)}
								</div>
							</div>

							{/* Post actions */}
							<div className="flex items-center gap-1">
								{isCreator && (
									<button
										type="button"
										onClick={() =>
											handlePin(
												post.id,
												post.is_pinned,
											)
										}
										className="rounded p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
										title={
											post.is_pinned
												? "Unpin post"
												: "Pin post"
										}
									>
										{post.is_pinned ? "Unpin" : "Pin"}
									</button>
								)}
								{(post.author_id === currentUserId ||
									isCreator) && (
									<button
										type="button"
										onClick={() => handleDelete(post.id)}
										disabled={deletingId === post.id}
										className="rounded p-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
									>
										{deletingId === post.id
											? "..."
											: "Delete"}
									</button>
								)}
							</div>
						</div>

						{/* Post content */}
						<p className="mt-3 whitespace-pre-wrap text-sm text-foreground leading-relaxed">
							{post.content}
						</p>

						{/* Poll options */}
						{post.post_type === "poll" && post.poll_options && (
							<div className="mt-4 space-y-2">
								{post.poll_options.map((option, index) => {
									const totalVotes = post.poll_options!.reduce(
										(sum, opt) => sum + opt.votes,
										0,
									);
									const percentage =
										totalVotes > 0
											? Math.round(
													(option.votes / totalVotes) *
														100,
												)
											: 0;

									return (
										<button
											type="button"
											key={index}
											onClick={() =>
												handleVote(post.id, index)
											}
											disabled={
												votingPostId === post.id ||
												!currentUserId
											}
											className="group relative w-full overflow-hidden rounded-md border border-border p-3 text-left transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-75"
										>
											<div
												className="absolute inset-0 bg-primary/10 transition-all"
												style={{
													width: `${percentage}%`,
												}}
											/>
											<div className="relative flex items-center justify-between">
												<span className="text-sm text-foreground">
													{option.text}
												</span>
												<span className="text-xs text-muted-foreground">
													{option.votes}{" "}
													{option.votes === 1
														? "vote"
														: "votes"}{" "}
													({percentage}%)
												</span>
											</div>
										</button>
									);
								})}
								<p className="text-xs text-muted-foreground">
									{post.poll_options.reduce(
										(sum, opt) => sum + opt.votes,
										0,
									)}{" "}
									total votes
								</p>
							</div>
						)}
					</article>
				))}
			</div>
		</div>
	);
}
