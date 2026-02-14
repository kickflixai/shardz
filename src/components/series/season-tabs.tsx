"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import { EpisodeListItem } from "@/components/series/episode-list-item";
import { UnlockButton } from "@/components/paywall/unlock-button";
import { Badge } from "@/components/ui/badge";
import { FREE_EPISODE_LIMIT } from "@/lib/access";
import { formatPrice } from "@/lib/stripe/prices";

interface SeasonEpisode {
	id: string;
	episode_number: number;
	title: string;
	description: string | null;
	duration_seconds: number | null;
	thumbnail_url: string | null;
	status: string;
}

interface SeasonData {
	id: string;
	season_number: number;
	title: string | null;
	price_cents: number | null;
	episodes: SeasonEpisode[];
}

interface SeasonTabsProps {
	seasons: SeasonData[];
	seriesSlug: string;
	purchasedSeasonIds?: Set<string>;
}

function SeasonPricing({
	season,
	isPurchased,
	seriesSlug,
}: {
	season: SeasonData;
	isPurchased: boolean;
	seriesSlug: string;
}) {
	if (isPurchased) {
		return (
			<Badge className="bg-brand-yellow/15 text-brand-yellow border-brand-yellow/30">
				Purchased
			</Badge>
		);
	}

	if (season.price_cents) {
		return (
			<div className="flex items-center gap-3">
				<span className="text-sm font-medium text-muted-foreground">
					{formatPrice(season.price_cents)}
				</span>
				<UnlockButton
					seasonId={season.id}
					seriesSlug={seriesSlug}
					priceCents={season.price_cents}
					purchaseType="single"
					label="Unlock"
				/>
			</div>
		);
	}

	return null;
}

export function SeasonTabs({
	seasons,
	seriesSlug,
	purchasedSeasonIds = new Set(),
}: SeasonTabsProps) {
	if (seasons.length === 0) {
		return (
			<p className="py-8 text-center text-muted-foreground">
				No seasons available yet.
			</p>
		);
	}

	// Single season: show episode list directly without tab switcher
	if (seasons.length === 1) {
		const season = seasons[0];
		const isPurchased = purchasedSeasonIds.has(season.id);

		return (
			<div className="space-y-1">
				<div className="mb-3 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-foreground">
						Episodes
					</h3>
					<SeasonPricing
						season={season}
						isPurchased={isPurchased}
						seriesSlug={seriesSlug}
					/>
				</div>
				{season.episodes.map((episode) => (
					<EpisodeListItem
						key={episode.id}
						episodeNumber={episode.episode_number}
						title={episode.title}
						durationSeconds={episode.duration_seconds}
						seriesSlug={seriesSlug}
						isFree={episode.episode_number <= FREE_EPISODE_LIMIT}
						isPublished={episode.status === "published"}
						isPurchased={isPurchased}
					/>
				))}
			</div>
		);
	}

	// Multiple seasons: show tabs
	const defaultTab = `season-${seasons[0].season_number}`;

	return (
		<Tabs defaultValue={defaultTab}>
			<TabsList>
				{seasons.map((season) => (
					<TabsTrigger
						key={season.id}
						value={`season-${season.season_number}`}
					>
						{season.title || `Season ${season.season_number}`}
					</TabsTrigger>
				))}
			</TabsList>
			{seasons.map((season) => {
				const isPurchased = purchasedSeasonIds.has(season.id);

				return (
					<TabsContent
						key={season.id}
						value={`season-${season.season_number}`}
					>
						{/* Season pricing header */}
						<div className="mb-2 mt-2 flex items-center justify-end">
							<SeasonPricing
								season={season}
								isPurchased={isPurchased}
								seriesSlug={seriesSlug}
							/>
						</div>
						<div className="space-y-1">
							{season.episodes.map((episode) => (
								<EpisodeListItem
									key={episode.id}
									episodeNumber={episode.episode_number}
									title={episode.title}
									durationSeconds={episode.duration_seconds}
									seriesSlug={seriesSlug}
									isFree={
										episode.episode_number <=
										FREE_EPISODE_LIMIT
									}
									isPublished={
										episode.status === "published"
									}
									isPurchased={isPurchased}
								/>
							))}
						</div>
					</TabsContent>
				);
			})}
		</Tabs>
	);
}
