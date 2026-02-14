import Link from "next/link";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EpisodeListItemProps {
	episodeNumber: number;
	title: string;
	durationSeconds: number | null;
	seriesSlug: string;
	isFree: boolean;
	isPublished: boolean;
}

function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export function EpisodeListItem({
	episodeNumber,
	title,
	durationSeconds,
	seriesSlug,
	isFree,
	isPublished,
}: EpisodeListItemProps) {
	const episodeLabel = String(episodeNumber).padStart(2, "0");

	const content = (
		<div className="flex items-center gap-4 px-4 py-3">
			<span className="w-8 shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
				{episodeLabel}
			</span>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-foreground">
					{title}
				</p>
				{durationSeconds != null && (
					<p className="text-xs text-muted-foreground">
						{formatDuration(durationSeconds)}
					</p>
				)}
			</div>
			<div className="shrink-0">
				{isFree ? (
					<Badge
						variant="secondary"
						className="bg-emerald-500/10 text-emerald-500"
					>
						Free
					</Badge>
				) : (
					<Lock className="h-4 w-4 text-muted-foreground" />
				)}
			</div>
		</div>
	);

	if (!isPublished) {
		return (
			<div className="opacity-50 cursor-not-allowed rounded-lg">
				{content}
			</div>
		);
	}

	return (
		<Link
			href={`/series/${seriesSlug}/episode/${episodeNumber}`}
			className="block rounded-lg transition-colors hover:bg-muted/50"
		>
			{content}
		</Link>
	);
}
