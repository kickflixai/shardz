import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
	Heart,
	Users,
	MessageSquare,
	Clock,
	Play,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserActivity } from "@/modules/social/queries/get-user-activity";
import { getUserFavorites } from "@/modules/social/queries/get-user-favorites";
import { getWatchHistory } from "@/modules/social/queries/get-watch-history";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getGenreLabel } from "@/config/genres";
import type { Genre } from "@/db/types";

interface UserPageProps {
	params: Promise<{ username: string }>;
}

function getInitials(name: string | null): string {
	if (!name) return "?";
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatDuration(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

async function getUserByUsername(username: string) {
	const supabase = await createClient();

	const { data } = await supabase
		.from("profiles")
		.select(
			"id, display_name, username, avatar_url, bio, follower_count, watch_history_public",
		)
		.eq("username", username)
		.single();

	return data;
}

export async function generateMetadata({
	params,
}: UserPageProps): Promise<Metadata> {
	const { username } = await params;
	const profile = await getUserByUsername(username);

	if (!profile) {
		return { title: "User Not Found" };
	}

	const displayName = profile.display_name || profile.username || "User";
	const siteUrl =
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

	return {
		title: `${displayName} - MicroShort`,
		description: profile.bio || `${displayName}'s activity on MicroShort`,
		openGraph: {
			title: `${displayName} - MicroShort`,
			description:
				profile.bio || `${displayName}'s activity on MicroShort`,
			url: `${siteUrl}/user/${username}`,
			siteName: "MicroShort",
			type: "profile",
			...(profile.avatar_url
				? {
						images: [
							{
								url: profile.avatar_url,
								width: 200,
								height: 200,
								alt: displayName,
							},
						],
					}
				: {}),
		},
	};
}

export default async function PublicUserPage({ params }: UserPageProps) {
	const { username } = await params;
	const profile = await getUserByUsername(username);

	if (!profile) {
		notFound();
	}

	const [favorites, activity] = await Promise.all([
		getUserFavorites(profile.id),
		getUserActivity(profile.id),
	]);

	// Only show watch history if user opted in
	const watchHistory = profile.watch_history_public
		? await getWatchHistory(profile.id)
		: [];

	const displayName = profile.display_name || profile.username || "User";

	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			{/* Profile Header */}
			<div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
				<Avatar className="size-24 text-2xl">
					{profile.avatar_url && (
						<AvatarImage src={profile.avatar_url} alt={displayName} />
					)}
					<AvatarFallback className="text-2xl">
						{getInitials(displayName)}
					</AvatarFallback>
				</Avatar>

				<div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
					<div className="flex flex-col items-center gap-2 sm:flex-row">
						<h1 className="text-2xl font-bold">{displayName}</h1>
						{profile.username && (
							<span className="text-muted-foreground">
								@{profile.username}
							</span>
						)}
					</div>

					{profile.bio && (
						<p className="max-w-xl text-center text-muted-foreground sm:text-left">
							{profile.bio}
						</p>
					)}

					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<Users className="size-4" />
							{profile.follower_count}{" "}
							{profile.follower_count === 1
								? "follower"
								: "followers"}
						</span>
						<span className="flex items-center gap-1.5">
							<Heart className="size-4" />
							{favorites.length} favorites
						</span>
					</div>
				</div>
			</div>

			{/* Favorites Section */}
			{favorites.length > 0 && (
				<section className="mt-10">
					<h2 className="mb-4 text-lg font-semibold">
						Favorite Series
					</h2>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{favorites.map((fav) => (
							<Link
								key={fav.id}
								href={`/series/${fav.series.slug}`}
								className="group overflow-hidden rounded-xl border border-border bg-card transition-transform hover:scale-[1.02]"
							>
								<div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
									{fav.series.thumbnail_url ? (
										<img
											src={fav.series.thumbnail_url}
											alt={fav.series.title}
											className="h-full w-full object-cover transition-transform group-hover:scale-105"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center text-muted-foreground">
											<Heart className="size-8 opacity-40" />
										</div>
									)}
								</div>
								<div className="p-3">
									<h3 className="line-clamp-1 text-sm font-semibold">
										{fav.series.title}
									</h3>
									<p className="text-xs text-muted-foreground">
										{fav.creator.display_name}
									</p>
									<Badge
										variant="secondary"
										className="mt-2 text-xs"
									>
										{getGenreLabel(fav.series.genre as Genre)}
									</Badge>
								</div>
							</Link>
						))}
					</div>
				</section>
			)}

			{/* Following Section */}
			{activity.followedCreators.length > 0 && (
				<section className="mt-10">
					<h2 className="mb-4 text-lg font-semibold">
						Following
					</h2>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{activity.followedCreators.map((follow) => (
							<Link
								key={follow.id}
								href={`/creator/${follow.creator.username || follow.creator.id}`}
								className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
							>
								<Avatar className="size-10">
									{follow.creator.avatar_url && (
										<AvatarImage
											src={follow.creator.avatar_url}
											alt={
												follow.creator.display_name ||
												"Creator"
											}
										/>
									)}
									<AvatarFallback>
										{getInitials(
											follow.creator.display_name,
										)}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium">
										{follow.creator.display_name ||
											"Creator"}
									</p>
									{follow.creator.username && (
										<p className="text-sm text-muted-foreground">
											@{follow.creator.username}
										</p>
									)}
								</div>
							</Link>
						))}
					</div>
				</section>
			)}

			{/* Recent Activity */}
			{activity.recentComments.length > 0 && (
				<section className="mt-10">
					<h2 className="mb-4 text-lg font-semibold">
						Recent Activity
					</h2>
					<div className="space-y-3">
						{activity.recentComments.slice(0, 10).map((comment) => (
							<div
								key={comment.id}
								className="rounded-lg border border-border p-4"
							>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<MessageSquare className="size-4" />
									<span>
										Commented on{" "}
										<Link
											href={`/series/${comment.series.slug}`}
											className="font-medium text-foreground hover:underline"
										>
											{comment.series.title}
										</Link>
										{" - "}Ep.{" "}
										{comment.episode.episode_number}
									</span>
								</div>
								<p className="mt-2 text-sm">{comment.content}</p>
								<p className="mt-1 text-xs text-muted-foreground">
									{formatDate(comment.created_at)}
								</p>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Watch History (if public) */}
			{profile.watch_history_public && watchHistory.length > 0 && (
				<section className="mt-10">
					<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
						<Clock className="size-5" />
						Watch History
					</h2>
					<div className="space-y-3">
						{watchHistory.slice(0, 10).map((entry) => (
							<Link
								key={entry.id}
								href={`/series/${entry.series.slug}`}
								className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
							>
								<div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
									{entry.series.thumbnail_url ? (
										<img
											src={entry.series.thumbnail_url}
											alt={entry.series.title}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center">
											<Play className="size-4 text-muted-foreground/40" />
										</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium line-clamp-1">
										{entry.series.title}
									</p>
									<p className="text-xs text-muted-foreground">
										Ep. {entry.episode.episode_number}:{" "}
										{entry.episode.title}
										{entry.completed
											? " (completed)"
											: ` - ${formatDuration(entry.progress_seconds)}`}
									</p>
								</div>
							</Link>
						))}
					</div>
				</section>
			)}

			{/* Empty state if nothing to show */}
			{favorites.length === 0 &&
				activity.followedCreators.length === 0 &&
				activity.recentComments.length === 0 && (
					<div className="mt-16 py-12 text-center">
						<p className="text-lg text-muted-foreground">
							No public activity yet
						</p>
					</div>
				)}
		</div>
	);
}
