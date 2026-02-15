interface SeriesStructuredDataProps {
	series: {
		slug: string;
		title: string;
		description: string | null;
		genre: string;
		thumbnail_url: string | null;
	};
	creator: {
		display_name: string | null;
		username: string | null;
	};
	seasons: Array<{
		season_number: number;
		title: string | null;
		episodes: Array<{
			episode_number: number;
			title: string;
			description: string | null;
			duration_seconds: number | null;
			thumbnail_url: string | null;
		}>;
	}>;
	siteUrl: string;
}

export function generateSeriesJsonLd({
	series,
	creator,
	seasons,
	siteUrl,
}: SeriesStructuredDataProps) {
	const seriesUrl = `${siteUrl}/series/${series.slug}`;

	return {
		"@context": "https://schema.org",
		"@type": "TVSeries",
		name: series.title,
		description: series.description,
		url: seriesUrl,
		image: series.thumbnail_url,
		genre: series.genre,
		creator: {
			"@type": "Person",
			name: creator.display_name || creator.username || "Shardz Creator",
		},
		containsSeason: seasons.map((season) => ({
			"@type": "TVSeason",
			seasonNumber: season.season_number,
			name: season.title || `Season ${season.season_number}`,
			numberOfEpisodes: season.episodes.length,
			episode: season.episodes.map((ep) => ({
				"@type": "TVEpisode",
				episodeNumber: ep.episode_number,
				name: ep.title,
				description: ep.description,
				url: `${seriesUrl}/episode/${ep.episode_number}`,
				duration: ep.duration_seconds
					? `PT${Math.floor(ep.duration_seconds / 60)}M${ep.duration_seconds % 60}S`
					: undefined,
				thumbnailUrl: ep.thumbnail_url,
			})),
		})),
		numberOfSeasons: seasons.length,
	};
}
