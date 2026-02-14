import { createClient } from "@/lib/supabase/server";
import { checkEpisodeAccess, FREE_EPISODE_LIMIT } from "@/lib/access";
import { hasUserPurchasedSeason } from "@/modules/purchases/queries/get-user-purchases";
import { VideoPlayerShell } from "@/components/player/video-player-shell";
import { PlayerLayout } from "@/components/player/player-layout";
import { SeasonPaywall } from "@/components/paywall/season-paywall";
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

	// For episodes beyond the free limit, fetch episode metadata first
	// so we have season_id for purchase check and paywall rendering
	if (episodeNumber > FREE_EPISODE_LIMIT) {
		// Fetch episode with season data for paywall
		const { data: episodeData } = await supabase
			.from("episodes")
			.select(
				`
				id,
				episode_number,
				title,
				season_id,
				seasons!inner (
					id,
					season_number,
					title,
					price_cents,
					series_id,
					series!inner (
						slug,
						title,
						thumbnail_url
					),
					episodes (
						id
					)
				)
			`,
			)
			.eq("episode_number", episodeNumber)
			.eq("seasons.series.slug", slug)
			.eq("seasons.episodes.status", "published")
			.single();

		if (!episodeData) {
			return (
				<div className="mx-auto max-w-2xl px-4 py-16 text-center">
					<h1 className="text-2xl font-bold text-foreground">
						Episode Not Found
					</h1>
					<p className="mt-2 text-muted-foreground">
						This episode could not be found.
					</p>
					<Link
						href={`/series/${slug}`}
						className="mt-6 inline-block text-sm text-brand-yellow transition-opacity hover:opacity-80"
					>
						Back to series
					</Link>
				</div>
			);
		}

		const season = episodeData.seasons as unknown as {
			id: string;
			season_number: number;
			title: string | null;
			price_cents: number | null;
			series_id: string;
			series: {
				slug: string;
				title: string;
				thumbnail_url: string | null;
			};
			episodes: Array<{ id: string }>;
		};

		// Check purchase status
		const hasPurchased = user
			? await hasUserPurchasedSeason(user.id, season.id)
			: false;

		const access = checkEpisodeAccess(episodeNumber, user, hasPurchased);

		// For both auth_required and payment_required, show the paywall.
		// "Value before account" pattern: unauthenticated users see the paywall,
		// and the UnlockButton inside handles login redirect when clicked.
		if (!access.allowed) {
			const priceCents = season.price_cents ?? 499;
			const totalEpisodes = season.episodes?.length ?? 0;

			return (
				<div className="bg-cinema-black">
					<div className="mx-auto max-w-4xl px-4 pt-4 pb-2">
						<Link
							href={`/series/${slug}`}
							className="text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							&larr; Back to series
						</Link>
					</div>
					<div className="mx-auto max-w-4xl px-4 py-8">
						<SeasonPaywall
							seasonId={season.id}
							seriesSlug={slug}
							seriesTitle={season.series.title}
							seasonTitle={season.title}
							seasonNumber={season.season_number}
							priceCents={priceCents}
							totalEpisodes={totalEpisodes}
							episodeNumber={episodeNumber}
							thumbnailUrl={season.series.thumbnail_url}
						/>
					</div>
				</div>
			);
		}

		// Access granted -- render player
		let nextEpisodeUrl: string | undefined;
		let nextEpisodeTitle: string | undefined;
		const { data: nextEpisode } = await supabase
			.from("episodes")
			.select("episode_number, title")
			.eq("season_id", episodeData.season_id)
			.eq("episode_number", episodeNumber + 1)
			.single();

		if (nextEpisode) {
			nextEpisodeUrl = `/series/${slug}/episode/${episodeNumber + 1}`;
			nextEpisodeTitle = nextEpisode.title;
		}

		return (
			<div className="bg-cinema-black">
				<div className="mx-auto max-w-4xl px-4 pt-4 pb-2">
					<Link
						href={`/series/${slug}`}
						className="text-sm text-muted-foreground transition-colors hover:text-primary"
					>
						&larr; Back to series
					</Link>
				</div>

				<PlayerLayout>
					<VideoPlayerShell
						episodeId={episodeData.id}
						nextEpisodeUrl={nextEpisodeUrl}
						nextEpisodeTitle={nextEpisodeTitle}
					/>
				</PlayerLayout>

				<div className="mx-auto max-w-4xl px-4 py-6">
					<h1 className="text-xl font-bold text-foreground">
						{episodeData.title}
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{season.series.title}
					</p>
					{access.reason === "purchased" && (
						<p className="mt-3 text-xs text-muted-foreground">
							Purchased
						</p>
					)}
				</div>
			</div>
		);
	}

	// Free episodes (1-3): simple access check, no purchase lookup needed
	const access = checkEpisodeAccess(episodeNumber, user, false);

	// This should always be allowed for episodes 1-3, but guard anyway
	if (!access.allowed) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-16 text-center">
				<h1 className="text-2xl font-bold text-foreground">
					Access Denied
				</h1>
				<p className="mt-2 text-muted-foreground">
					You do not have access to this episode.
				</p>
			</div>
		);
	}

	// Fetch episode data for player (free episodes)
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
					slug,
					title
				)
			)
		`,
		)
		.eq("episode_number", episodeNumber)
		.eq("seasons.series.slug", slug)
		.single();

	// Determine next episode URL and title
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

	const seriesTitle = episode
		? (
				episode.seasons as unknown as {
					series: { slug: string; title: string };
				}
			).series.title
		: slug;

	return (
		<div className="bg-cinema-black">
			<div className="mx-auto max-w-4xl px-4 pt-4 pb-2">
				<Link
					href={`/series/${slug}`}
					className="text-sm text-muted-foreground transition-colors hover:text-primary"
				>
					&larr; Back to series
				</Link>
			</div>

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

			<div className="mx-auto max-w-4xl px-4 py-6">
				<h1 className="text-xl font-bold text-foreground">
					{episode ? episode.title : `Episode ${episodeNumber}`}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{seriesTitle}
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
