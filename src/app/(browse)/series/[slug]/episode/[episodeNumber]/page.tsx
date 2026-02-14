import { createClient } from "@/lib/supabase/server";
import { checkEpisodeAccess } from "@/lib/access";
import { VideoPlayerShell } from "@/components/player/video-player-shell";
import { PlayerLayout } from "@/components/player/player-layout";
import Link from "next/link";

interface EpisodePageProps {
	params: Promise<{ slug: string; episodeNumber: string }>;
}

export default async function EpisodePage({ params }: EpisodePageProps) {
	const { slug, episodeNumber: episodeNumberStr } = await params;
	const episodeNumber = Number.parseInt(episodeNumberStr, 10);

	if (Number.isNaN(episodeNumber) || episodeNumber < 1) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-16 text-center">
				<h1 className="text-2xl font-bold text-foreground">
					Invalid Episode
				</h1>
				<p className="mt-2 text-muted-foreground">
					The episode number is invalid.
				</p>
			</div>
		);
	}

	// Check auth state
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Check access (hasPurchased = false for now, Phase 5 will add purchase checks)
	const access = checkEpisodeAccess(episodeNumber, user, false);

	if (!access.allowed && access.reason === "auth_required") {
		return (
			<div className="mx-auto max-w-2xl px-4 py-16 text-center">
				<h1 className="text-2xl font-bold text-foreground">
					Sign Up to Continue Watching
				</h1>
				<p className="mt-4 text-muted-foreground">
					Episodes 1-3 are free. Create an account to unlock more
					episodes.
				</p>
				<div className="mt-8 flex justify-center gap-4">
					<Link
						href="/signup"
						className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Create Account
					</Link>
					<Link
						href="/login"
						className="rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
					>
						Sign In
					</Link>
				</div>
			</div>
		);
	}

	if (!access.allowed && access.reason === "payment_required") {
		return (
			<div className="mx-auto max-w-2xl px-4 py-16 text-center">
				<h1 className="text-2xl font-bold text-foreground">
					Unlock This Season
				</h1>
				<p className="mt-4 text-muted-foreground">
					This episode requires a season unlock. Payments coming soon.
				</p>
				<p className="mt-2 text-sm text-muted-foreground">
					Coming in Phase 5.
				</p>
			</div>
		);
	}

	// Access granted -- fetch episode data for player
	// Query the episode by matching slug -> series -> seasons -> episodes
	const { data: episode } = await supabase
		.from("episodes")
		.select(
			`
			id,
			episode_number,
			title,
			season_id,
			seasons!inner (
				id,
				series_id,
				series!inner (
					slug
				)
			)
		`,
		)
		.eq("episode_number", episodeNumber)
		.eq("seasons.series.slug", slug)
		.single();

	// Determine next episode URL and title (same season, next episode number)
	let nextEpisodeUrl: string | undefined;
	let nextEpisodeTitle: string | undefined;
	if (episode) {
		const { data: nextEpisode } = await supabase
			.from("episodes")
			.select("episode_number, title")
			.eq("season_id", episode.season_id)
			.eq("episode_number", episodeNumber + 1)
			.single();

		if (nextEpisode) {
			nextEpisodeUrl = `/series/${slug}/episode/${episodeNumber + 1}`;
			nextEpisodeTitle = nextEpisode.title;
		}
	}

	return (
		<div className="bg-cinema-black">
			{/* Navigation: back to series */}
			<div className="mx-auto max-w-4xl px-4 pt-4 pb-2">
				<Link
					href={`/series/${slug}`}
					className="text-sm text-muted-foreground transition-colors hover:text-primary"
				>
					&larr; Back to series
				</Link>
			</div>

			{/* Player: hero element */}
			<PlayerLayout>
				{episode ? (
					<VideoPlayerShell
						episodeId={episode.id}
						nextEpisodeUrl={nextEpisodeUrl}
						nextEpisodeTitle={nextEpisodeTitle}
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-cinema-black text-cinema-muted">
						<p>Episode not found</p>
					</div>
				)}
			</PlayerLayout>

			{/* Episode info below player */}
			<div className="mx-auto max-w-4xl px-4 py-6">
				<h1 className="text-xl font-bold text-foreground">
					{episode ? episode.title : `Episode ${episodeNumber}`}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Series: {slug}
				</p>
				{access.reason === "free" && (
					<p className="mt-3 text-sm text-muted-foreground">
						Free episode ({episodeNumber} of 3 free)
					</p>
				)}
			</div>
		</div>
	);
}
