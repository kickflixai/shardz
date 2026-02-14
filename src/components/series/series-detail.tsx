import Image from "next/image";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getGenreLabel } from "@/config/genres";
import { ShareButton } from "@/components/share/share-button";
import { CreatorInfo } from "@/components/series/creator-info";
import { SeasonTabs } from "@/components/series/season-tabs";
import type { Genre } from "@/db/types";

interface SeriesDetailProps {
	series: {
		slug: string;
		title: string;
		description: string | null;
		genre: Genre;
		thumbnail_url: string | null;
		view_count: number;
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

export function SeriesDetail({ series }: SeriesDetailProps) {
	const creatorName = series.profiles.display_name || "Creator";
	const siteUrl =
		process.env.NEXT_PUBLIC_APP_URL || "https://microshort.tv";
	const seriesUrl = `${siteUrl}/series/${series.slug}`;

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
				/>
			</div>
		</div>
	);
}
