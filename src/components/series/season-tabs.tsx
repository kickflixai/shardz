"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import { EpisodeListItem } from "@/components/series/episode-list-item";
import { FREE_EPISODE_LIMIT } from "@/lib/access";

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
	episodes: SeasonEpisode[];
}

interface SeasonTabsProps {
	seasons: SeasonData[];
	seriesSlug: string;
}

export function SeasonTabs({ seasons, seriesSlug }: SeasonTabsProps) {
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
		return (
			<div className="space-y-1">
				<h3 className="mb-3 text-lg font-semibold text-foreground">
					Episodes
				</h3>
				{season.episodes.map((episode) => (
					<EpisodeListItem
						key={episode.id}
						episodeNumber={episode.episode_number}
						title={episode.title}
						durationSeconds={episode.duration_seconds}
						seriesSlug={seriesSlug}
						isFree={episode.episode_number <= FREE_EPISODE_LIMIT}
						isPublished={episode.status === "published"}
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
			{seasons.map((season) => (
				<TabsContent
					key={season.id}
					value={`season-${season.season_number}`}
				>
					<div className="mt-2 space-y-1">
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
								isPublished={episode.status === "published"}
							/>
						))}
					</div>
				</TabsContent>
			))}
		</Tabs>
	);
}
