"use client";

import Link from "next/link";
import { Play, Lock } from "lucide-react";

interface Episode {
	episode_number: number;
	title: string;
	duration_seconds: number | null;
	is_free: boolean;
}

interface EpisodeSidebarProps {
	episodes: Episode[];
	seriesSlug: string;
	seriesTitle: string;
	currentEpisodeNumber: number;
}

function formatDuration(seconds: number | null): string {
	if (!seconds) return "0:15";
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function EpisodeSidebar({
	episodes,
	seriesSlug,
	seriesTitle,
	currentEpisodeNumber,
}: EpisodeSidebarProps) {
	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-white/10 px-4 py-3">
				<h3 className="text-sm font-bold text-white">{seriesTitle}</h3>
				<p className="text-xs text-white/50">
					{episodes.length} episodes
				</p>
			</div>
			<div className="flex-1 overflow-y-auto">
				{episodes.map((ep) => {
					const isCurrent = ep.episode_number === currentEpisodeNumber;
					const href = `/series/${seriesSlug}/episode/${ep.episode_number}`;

					return (
						<Link
							key={ep.episode_number}
							href={href}
							className={`flex items-center gap-3 px-4 py-3 transition-colors ${
								isCurrent
									? "bg-brand-yellow/10 border-l-2 border-brand-yellow"
									: "hover:bg-white/5 border-l-2 border-transparent"
							}`}
						>
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/60">
								{isCurrent ? (
									<Play className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
								) : ep.is_free ? (
									<span>{ep.episode_number}</span>
								) : (
									<Lock className="h-3 w-3 text-white/40" />
								)}
							</div>
							<div className="min-w-0 flex-1">
								<p
									className={`truncate text-sm font-medium ${
										isCurrent ? "text-brand-yellow" : "text-white/80"
									}`}
								>
									{ep.title}
								</p>
								<p className="text-xs text-white/40">
									{ep.is_free ? "Free" : "Premium"} · {formatDuration(ep.duration_seconds)}
								</p>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
