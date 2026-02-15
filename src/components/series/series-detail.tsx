import Image from "next/image";
import Link from "next/link";
import { Eye, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getGenreLabel } from "@/config/genres";
import { ShareButton } from "@/components/share/share-button";
import { FavoriteButton } from "@/components/social/favorite-button";
import { CreatorInfo } from "@/components/series/creator-info";
import { SeasonTabs } from "@/components/series/season-tabs";
import { UnlockButton } from "@/components/paywall/unlock-button";
import { generateShareUrl } from "@/lib/seo/share";
import { formatPrice, calculateBundlePrice } from "@/lib/stripe/prices";
import type { Genre } from "@/db/types";

interface SeriesDetailProps {
	series: {
		id: string;
		slug: string;
		title: string;
		description: string | null;
		genre: Genre;
		thumbnail_url: string | null;
		view_count: number;
		bundle_discount_percent: number | null;
		profiles: {
			id: string;
			display_name: string | null;
			username: string | null;
			avatar_url: string | null;
			bio: string | null;
		};
		seasons: Array<{
			id: string;
			season_number: number;
			title: string | null;
			price_cents: number | null;
			episodes: Array<{
				id: string;
				episode_number: number;
				title: string;
				description: string | null;
				duration_seconds: number | null;
				thumbnail_url: string | null;
				status: string;
			}>;
		}>;
	};
	purchasedSeasonIds?: Set<string>;
	isFavorited?: boolean;
	isAuthenticated?: boolean;
}

function formatViewCount(count: number): string {
	if (count >= 1_000_000) {
		return `${(count / 1_000_000).toFixed(1)}M`;
	}
	if (count >= 1_000) {
		return `${(count / 1_000).toFixed(1)}K`;
	}
	return count.toString();
}

export function SeriesDetail({
	series,
	purchasedSeasonIds = new Set(),
	isFavorited = false,
	isAuthenticated = false,
}: SeriesDetailProps) {
	const creatorName = series.profiles.display_name || "Creator";
	const seriesUrl = generateShareUrl({ slug: series.slug });

	// Calculate bundle info for multiple seasons
	const unpurchasedSeasons = series.seasons.filter(
		(s) => !purchasedSeasonIds.has(s.id) && s.price_cents,
	);
	const hasMultipleSeasons = series.seasons.length > 1;
	const hasUnpurchasedSeasons = unpurchasedSeasons.length > 1;
	const showBundle = hasMultipleSeasons && hasUnpurchasedSeasons;

	let bundlePriceCents = 0;
	let originalTotalCents = 0;
	const discountPercent = series.bundle_discount_percent ?? 15;

	if (showBundle) {
		const prices = unpurchasedSeasons.map((s) => s.price_cents!);
		originalTotalCents = prices.reduce((sum, p) => sum + p, 0);
		bundlePriceCents = calculateBundlePrice(prices, discountPercent);
	}

	// Find first published episode URL
	const firstEpisodeUrl = (() => {
		for (const season of series.seasons) {
			for (const ep of season.episodes) {
				if (ep.status === "published") {
					return `/series/${series.slug}/episode/${ep.episode_number}`;
				}
			}
		}
		return null;
	})();

	return (
		<div className="space-y-8">
			{/* Hero: Poster + Info side-by-side on desktop, stacked on mobile */}
			<div className="flex flex-col gap-6 md:flex-row md:gap-8">
				{/* Poster with play button overlay */}
				<div className="relative mx-auto w-full max-w-xs shrink-0 md:mx-0 md:w-72 lg:w-80">
					<div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-cinema-surface">
						{series.thumbnail_url ? (
							<Image
								src={series.thumbnail_url}
								alt={series.title}
								fill
								className="object-cover"
								priority
								sizes="(max-width: 768px) 320px, 320px"
							/>
						) : (
							<div className="flex h-full items-center justify-center">
								<p className="text-lg text-muted-foreground">
									{series.title}
								</p>
							</div>
						)}

						{/* Play button overlay */}
						{firstEpisodeUrl && (
							<Link
								href={firstEpisodeUrl}
								className="absolute inset-0 flex items-center justify-center"
							>
								<div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cinema-black/50 bg-[#E0B800] shadow-lg shadow-[#E0B800]/30 transition-transform hover:scale-110">
									<Play className="h-7 w-7 fill-cinema-black text-cinema-black ml-0.5" />
								</div>
							</Link>
						)}
					</div>
				</div>

				{/* Info column */}
				<div className="flex flex-1 flex-col gap-4">
					{/* Title, Genre, Views */}
					<div className="space-y-3">
						<h1 className="text-3xl font-bold text-foreground">
							{series.title}
						</h1>
						<div className="flex flex-wrap items-center gap-3">
							<Badge variant="secondary">
								{getGenreLabel(series.genre)}
							</Badge>
							{series.view_count > 0 && (
								<span className="flex items-center gap-1 text-sm text-muted-foreground">
									<Eye className="h-4 w-4" />
									{formatViewCount(series.view_count)} views
								</span>
							)}
						</div>
					</div>

					{/* Description */}
					{series.description && (
						<p className="text-base leading-relaxed text-muted-foreground">
							{series.description}
						</p>
					)}

					{/* Share & Favorite */}
					<div className="flex items-center gap-2">
						<ShareButton
							title={series.title}
							text={
								series.description
									? series.description.slice(0, 120)
									: `Watch ${series.title} on Shardz`
							}
							url={seriesUrl}
						/>
						<FavoriteButton
							seriesId={series.id}
							initialFavorited={isFavorited}
							isAuthenticated={isAuthenticated}
						/>
					</div>

					{/* Creator Info */}
					<CreatorInfo
						displayName={creatorName}
						username={series.profiles.username}
						avatarUrl={series.profiles.avatar_url}
						bio={series.profiles.bio}
					/>

					{/* Bundle Offer */}
					{showBundle && (
						<div className="rounded-xl border border-brand-yellow/20 bg-brand-yellow/5 p-6">
							<h3 className="text-lg font-bold text-foreground">
								Unlock All Seasons
							</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								Get access to all {unpurchasedSeasons.length} remaining
								seasons at {discountPercent}% off
							</p>
							<div className="mt-4 flex items-center gap-3">
								<span className="text-sm text-muted-foreground line-through">
									{formatPrice(originalTotalCents)}
								</span>
								<span className="text-2xl font-bold text-brand-yellow">
									{formatPrice(bundlePriceCents)}
								</span>
							</div>
							<div className="mt-4">
								<UnlockButton
									seasonId=""
									seriesSlug={series.slug}
									priceCents={bundlePriceCents}
									purchaseType="bundle"
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Seasons / Episodes — full width */}
			<div className="space-y-2">
				<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
					Seasons & Episodes
				</h2>
				<SeasonTabs
					seasons={series.seasons}
					seriesSlug={series.slug}
					purchasedSeasonIds={purchasedSeasonIds}
				/>
			</div>
		</div>
	);
}
