import Link from "next/link";
import { redirect } from "next/navigation";
import {
	Heart,
	Clock,
	Settings,
	Users,
	MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserActivity } from "@/modules/social/queries/get-user-activity";
import { getUserFavorites } from "@/modules/social/queries/get-user-favorites";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default async function ProfilePage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?next=/profile");
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select(
			"display_name, username, avatar_url, bio, follower_count, watch_history_public",
		)
		.eq("id", user.id)
		.single();

	if (!profile) {
		redirect("/login");
	}

	const [favorites, activity] = await Promise.all([
		getUserFavorites(user.id),
		getUserActivity(user.id),
	]);

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
							<Heart className="size-4" />
							{favorites.length} favorites
						</span>
						<span className="flex items-center gap-1.5">
							<Users className="size-4" />
							{activity.followedCreators.length} following
						</span>
					</div>

					<div className="flex gap-3">
						<Link
							href="/profile/settings"
							className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
						>
							<Settings className="size-4" />
							Edit Profile
						</Link>
						<Link
							href="/profile/history"
							className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
						>
							<Clock className="size-4" />
							Watch History
						</Link>
					</div>
				</div>
			</div>

			{/* Tabbed Content */}
			<Tabs defaultValue="favorites" className="mt-8">
				<TabsList>
					<TabsTrigger value="favorites">
						Favorites ({favorites.length})
					</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
					<TabsTrigger value="following">
						Following ({activity.followedCreators.length})
					</TabsTrigger>
				</TabsList>

				{/* Favorites Tab */}
				<TabsContent value="favorites" className="mt-6">
					{favorites.length === 0 ? (
						<div className="py-12 text-center">
							<Heart className="mx-auto size-12 text-muted-foreground/40" />
							<p className="mt-4 text-lg text-muted-foreground">
								No favorites yet
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Browse series to find content you love.
							</p>
							<Link
								href="/browse"
								className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
							>
								Browse Series
							</Link>
						</div>
					) : (
						<div>
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
								{favorites.slice(0, 8).map((fav) => (
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
										</div>
									</Link>
								))}
							</div>
							{favorites.length > 8 && (
								<div className="mt-4 text-center">
									<Link
										href="/profile/favorites"
										className="text-sm font-medium text-primary hover:underline"
									>
										View all {favorites.length} favorites
									</Link>
								</div>
							)}
						</div>
					)}
				</TabsContent>

				{/* Activity Tab */}
				<TabsContent value="activity" className="mt-6">
					{activity.recentComments.length === 0 ? (
						<div className="py-12 text-center">
							<MessageSquare className="mx-auto size-12 text-muted-foreground/40" />
							<p className="mt-4 text-lg text-muted-foreground">
								No recent activity
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Your comments and reactions will appear here.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{activity.recentComments.map((comment) => (
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
											{" - "}Ep. {comment.episode.episode_number}
										</span>
									</div>
									<p className="mt-2 text-sm">{comment.content}</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{formatDate(comment.created_at)}
									</p>
								</div>
							))}
						</div>
					)}
				</TabsContent>

				{/* Following Tab */}
				<TabsContent value="following" className="mt-6">
					{activity.followedCreators.length === 0 ? (
						<div className="py-12 text-center">
							<Users className="mx-auto size-12 text-muted-foreground/40" />
							<p className="mt-4 text-lg text-muted-foreground">
								Not following anyone yet
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Follow creators to keep up with their latest content.
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{activity.followedCreators.map((follow) => (
								<Link
									key={follow.id}
									href={`/creator/${follow.creator.username || follow.creator.id}`}
									className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
								>
									<Avatar className="size-12">
										{follow.creator.avatar_url && (
											<AvatarImage
												src={follow.creator.avatar_url}
												alt={
													follow.creator.display_name || "Creator"
												}
											/>
										)}
										<AvatarFallback>
											{getInitials(follow.creator.display_name)}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">
											{follow.creator.display_name || "Creator"}
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
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
