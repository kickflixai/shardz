import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, Play, Lock, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWatchHistory } from "@/modules/social/queries/get-watch-history";

function formatTimeAgo(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function formatDuration(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function HistoryPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?next=/profile/history");
	}

	const [watchHistory, purchasesResult] = await Promise.all([
		getWatchHistory(user.id),
		supabase
			.from("purchases")
			.select(
				`
				id,
				amount_cents,
				created_at,
				seasons!inner(title, season_number, series!inner(title, slug, thumbnail_url))
			`,
			)
			.eq("user_id", user.id)
			.eq("status", "completed")
			.order("created_at", { ascending: false }),
	]);

	const purchases = (purchasesResult.data ?? []).map((row) => {
		const season = row.seasons as unknown as {
			title: string | null;
			season_number: number;
			series: {
				title: string;
				slug: string;
				thumbnail_url: string | null;
			};
		};
		return {
			id: row.id,
			amount_cents: row.amount_cents,
			created_at: row.created_at,
			season_title: season.title,
			season_number: season.season_number,
			series_title: season.series.title,
			series_slug: season.series.slug,
			series_thumbnail: season.series.thumbnail_url,
		};
	});

	const continueWatching = watchHistory.filter((e) => !e.completed);
	const completed = watchHistory.filter((e) => e.completed);

	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<div className="mb-6 flex items-center gap-4">
				<Link
					href="/profile"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
					Back to Profile
				</Link>
			</div>

			<h1 className="text-2xl font-bold">Watch History</h1>
			<p className="mt-1 text-muted-foreground">
				Your viewing activity and unlocked content
			</p>

			{watchHistory.length === 0 && purchases.length === 0 ? (
				<div className="py-16 text-center">
					<Clock className="mx-auto size-16 text-muted-foreground/40" />
					<p className="mt-4 text-lg text-muted-foreground">
						No watch history yet
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						Start watching to track your progress.
					</p>
					<Link
						href="/browse"
						className="mt-6 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
					>
						Browse Series
					</Link>
				</div>
			) : (
				<div className="mt-8 space-y-10">
					{/* Continue Watching */}
					{continueWatching.length > 0 && (
						<section>
							<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
								<Play className="size-5" />
								Continue Watching
							</h2>
							<div className="space-y-3">
								{continueWatching.map((entry) => (
									<Link
										key={entry.id}
										href={`/series/${entry.series.slug}`}
										className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
									>
										<div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
											{entry.series.thumbnail_url ? (
												<img
													src={entry.series.thumbnail_url}
													alt={entry.series.title}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center">
													<Play className="size-6 text-muted-foreground/40" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium line-clamp-1">
												{entry.series.title}
											</p>
											<p className="text-sm text-muted-foreground">
												Ep. {entry.episode.episode_number}:{" "}
												{entry.episode.title}
											</p>
											{/* Progress bar */}
											<div className="mt-2 flex items-center gap-2">
												<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
													<div
														className="h-full rounded-full bg-primary"
														style={{
															width: `${Math.min(
																(entry.progress_seconds / 300) *
																	100,
																100,
															)}%`,
														}}
													/>
												</div>
												<span className="text-xs text-muted-foreground">
													{formatDuration(
														entry.progress_seconds,
													)}
												</span>
											</div>
										</div>
										<span className="text-xs text-muted-foreground">
											{formatTimeAgo(entry.last_watched_at)}
										</span>
									</Link>
								))}
							</div>
						</section>
					)}

					{/* Completed */}
					{completed.length > 0 && (
						<section>
							<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
								<Clock className="size-5" />
								Completed
							</h2>
							<div className="space-y-3">
								{completed.map((entry) => (
									<Link
										key={entry.id}
										href={`/series/${entry.series.slug}`}
										className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
									>
										<div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
											{entry.series.thumbnail_url ? (
												<img
													src={entry.series.thumbnail_url}
													alt={entry.series.title}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center">
													<Play className="size-6 text-muted-foreground/40" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium line-clamp-1">
												{entry.series.title}
											</p>
											<p className="text-sm text-muted-foreground">
												Ep. {entry.episode.episode_number}:{" "}
												{entry.episode.title}
											</p>
										</div>
										<span className="text-xs text-muted-foreground">
											{formatTimeAgo(entry.last_watched_at)}
										</span>
									</Link>
								))}
							</div>
						</section>
					)}

					{/* Unlocked Content */}
					{purchases.length > 0 && (
						<section>
							<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
								<Lock className="size-5" />
								Unlocked Content
							</h2>
							<div className="space-y-3">
								{purchases.map((purchase) => (
									<Link
										key={purchase.id}
										href={`/series/${purchase.series_slug}`}
										className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
									>
										<div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
											{purchase.series_thumbnail ? (
												<img
													src={purchase.series_thumbnail}
													alt={purchase.series_title}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center">
													<Lock className="size-6 text-muted-foreground/40" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium line-clamp-1">
												{purchase.series_title}
											</p>
											<p className="text-sm text-muted-foreground">
												Season {purchase.season_number}
												{purchase.season_title
													? `: ${purchase.season_title}`
													: ""}
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium">
												${(purchase.amount_cents / 100).toFixed(2)}
											</p>
											<p className="text-xs text-muted-foreground">
												{new Date(
													purchase.created_at,
												).toLocaleDateString()}
											</p>
										</div>
									</Link>
								))}
							</div>
						</section>
					)}
				</div>
			)}
		</div>
	);
}
