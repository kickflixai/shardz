"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
	ArrowUp,
	ArrowDown,
	Pencil,
	Trash2,
	GripVertical,
} from "lucide-react";
import {
	reorderEpisodes,
	deleteEpisode,
} from "@/modules/creator/actions/episodes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ContentStatus } from "@/db/types";

interface EpisodeItem {
	id: string;
	episodeNumber: number;
	title: string;
	status: ContentStatus;
	durationSeconds: number | null;
	thumbnailUrl: string | null;
	sortOrder: number;
}

interface EpisodeListManagerProps {
	seasonId: string;
	seriesId: string;
	episodes: EpisodeItem[];
}

const statusConfig: Record<
	ContentStatus,
	{ label: string; className: string }
> = {
	draft: {
		label: "Draft",
		className: "bg-muted text-muted-foreground",
	},
	processing: {
		label: "Processing",
		className: "bg-yellow-500/10 text-yellow-600",
	},
	ready: {
		label: "Ready",
		className: "bg-green-500/10 text-green-600",
	},
	published: {
		label: "Published",
		className: "bg-blue-500/10 text-blue-600",
	},
	archived: {
		label: "Archived",
		className: "bg-muted text-muted-foreground",
	},
};

function formatDuration(seconds: number | null): string {
	if (!seconds) return "--:--";
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Reorderable episode list with status indicators.
 *
 * Uses move-up/move-down buttons for reorder (simple, accessible, no DnD library).
 * Calls reorderEpisodes server action with new ordered IDs.
 * Edit links to episode edit page, delete with confirmation.
 */
export function EpisodeListManager({
	seasonId,
	seriesId,
	episodes: initialEpisodes,
}: EpisodeListManagerProps) {
	const [episodes, setEpisodes] = useState(initialEpisodes);
	const [isPending, startTransition] = useTransition();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	function moveEpisode(index: number, direction: "up" | "down") {
		const newIndex = direction === "up" ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= episodes.length) return;

		const updated = [...episodes];
		[updated[index], updated[newIndex]] = [
			updated[newIndex],
			updated[index],
		];
		setEpisodes(updated);

		const orderedIds = updated.map((ep) => ep.id);
		startTransition(async () => {
			const result = await reorderEpisodes(seasonId, orderedIds);
			if (result.success) {
				toast.success("Episodes reordered");
			} else {
				// Revert on failure
				setEpisodes(initialEpisodes);
				toast.error(result.message || "Failed to reorder");
			}
		});
	}

	async function handleDelete(episodeId: string) {
		const confirmed = window.confirm(
			"Are you sure you want to delete this episode? This cannot be undone.",
		);
		if (!confirmed) return;

		setDeletingId(episodeId);
		const result = await deleteEpisode(episodeId);
		setDeletingId(null);

		if (result.success) {
			setEpisodes((prev) => prev.filter((ep) => ep.id !== episodeId));
			toast.success("Episode deleted");
		} else {
			toast.error(result.message || "Failed to delete episode");
		}
	}

	return (
		<div className="divide-y divide-border rounded-lg border border-border">
			{episodes.map((episode, index) => {
				const status = statusConfig[episode.status] ?? statusConfig.draft;
				return (
					<div
						key={episode.id}
						className="flex items-center gap-3 p-3"
					>
						{/* Grip indicator */}
						<GripVertical className="size-4 shrink-0 text-muted-foreground" />

						{/* Thumbnail */}
						<div className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
							{episode.thumbnailUrl ? (
								<Image
									src={episode.thumbnailUrl}
									alt={episode.title}
									fill
									className="object-cover"
									unoptimized
								/>
							) : (
								<div className="flex h-full items-center justify-center text-xs text-muted-foreground">
									{episode.episodeNumber}
								</div>
							)}
						</div>

						{/* Episode info */}
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<span className="text-xs font-medium text-muted-foreground">
									Ep {episode.episodeNumber}
								</span>
								<span className="truncate text-sm font-medium text-foreground">
									{episode.title}
								</span>
							</div>
							<div className="flex items-center gap-2 mt-0.5">
								<Badge
									variant="secondary"
									className={status.className}
								>
									{status.label}
								</Badge>
								<span className="text-xs text-muted-foreground">
									{formatDuration(episode.durationSeconds)}
								</span>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-1 shrink-0">
							<Button
								variant="ghost"
								size="icon-xs"
								disabled={index === 0 || isPending}
								onClick={() => moveEpisode(index, "up")}
								title="Move up"
							>
								<ArrowUp className="size-3" />
							</Button>
							<Button
								variant="ghost"
								size="icon-xs"
								disabled={
									index === episodes.length - 1 || isPending
								}
								onClick={() => moveEpisode(index, "down")}
								title="Move down"
							>
								<ArrowDown className="size-3" />
							</Button>
							<Button
								variant="ghost"
								size="icon-xs"
								asChild
							>
								<Link
									href={`/dashboard/series/${seriesId}/seasons/${seasonId}/episodes/${episode.id}`}
									title="Edit episode"
								>
									<Pencil className="size-3" />
								</Link>
							</Button>
							<Button
								variant="ghost"
								size="icon-xs"
								disabled={deletingId === episode.id}
								onClick={() => handleDelete(episode.id)}
								title="Delete episode"
								className="text-destructive hover:text-destructive"
							>
								<Trash2 className="size-3" />
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
}
