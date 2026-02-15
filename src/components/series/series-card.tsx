import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getGenreLabel } from "@/config/genres";
import type { SeriesWithCreator } from "@/modules/content/types";

interface SeriesCardProps {
	series: SeriesWithCreator;
}

export function SeriesCard({ series }: SeriesCardProps) {
	return (
		<Link
			href={`/series/${series.slug}`}
			className="group block overflow-hidden rounded-xl border border-border bg-card transition-transform hover:scale-[1.02]"
		>
			{/* Thumbnail area -- 3:4 portrait ratio (mobile-first) */}
			<div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
				{series.thumbnail_url ? (
					<img
						src={series.thumbnail_url}
						alt={series.title}
						className="h-full w-full object-cover transition-transform group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="opacity-40"
							aria-hidden="true"
						>
							<title>Video placeholder</title>
							<polygon points="6 3 20 12 6 21 6 3" />
						</svg>
					</div>
				)}
			</div>

			{/* Card content */}
			<div className="p-4">
				<h3 className="line-clamp-1 text-base font-semibold text-foreground">
					{series.title}
				</h3>

				<Badge variant="secondary" className="mt-2">
					{getGenreLabel(series.genre)}
				</Badge>

				<div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
					<span className="truncate">{series.creator.display_name}</span>
					<span className="shrink-0 ml-2">
						{series.episode_count} {series.episode_count === 1 ? "episode" : "episodes"}
					</span>
				</div>
			</div>
		</Link>
	);
}
