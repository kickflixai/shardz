import Image from "next/image";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getGenreLabel } from "@/config/genres";
import { ShareButton } from "@/components/share/share-button";
import { CreatorInfo } from "@/components/series/creator-info";
import { SeasonTabs } from "@/components/series/season-tabs";
import { UnlockButton } from "@/components/paywall/unlock-button";
import { generateShareUrl } from "@/lib/seo/share";
import { formatPrice, calculateBundlePrice } from "@/lib/stripe/prices";
import type { Genre } from "@/db/types";

interface SeriesDetailProps {
	series: {
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

	return (
		<div className="space-y-8">
			{/* Hero / Thumbnail */}
			<div className="relative aspect-video w-full overflow-hidden rounded-xl bg-cinema-surface">
				{series.thumbnail_url ? (
					<Image
						src={series.thumbnail_url}
						alt={series.title}
						fill
						className="object-cover"
						priority
						sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
					/>
				) : (
					<div className="flex h-full items-center justify-center">
						<p className="text-lg text-muted-foreground">
							{series.title}
						</p>
					</div>
				)}
			</div>

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

			{/* Share Button */}
			<ShareButton
				title={series.title}
				text={
					series.description
						? series.description.slice(0, 120)
						: `Watch ${series.title} on MicroShort`
				}
				url={seriesUrl}
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

			{/* Creator Info */}
			<div className="space-y-2">
				<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
					Creator
				</h2>
				<CreatorInfo
					displayName={creatorName}
					username={series.profiles.username}
					avatarUrl={series.profiles.avatar_url}
					bio={series.profiles.bio}
				/>
			</div>

			{/* Seasons / Episodes */}
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
