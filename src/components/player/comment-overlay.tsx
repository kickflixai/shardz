"use client";

import type { CommentWithProfile } from "@/modules/social/hooks/use-comments";
import { ReportButton } from "@/components/social/report-button";

interface CommentOverlayProps {
	comments: CommentWithProfile[];
	visible: boolean;
}

/**
 * Scrolling comments overlay at the bottom 25% of the video player.
 * Comments slide upward with a fade animation, synced to playback timestamps.
 * Hidden when cinematic mode is active.
 */
export function CommentOverlay({ comments, visible }: CommentOverlayProps) {
	return (
		<div
			className={`absolute inset-x-0 bottom-0 z-10 flex h-1/4 flex-col justify-end overflow-hidden transition-opacity duration-300 ${
				visible
					? "opacity-100"
					: "pointer-events-none opacity-0"
			}`}
		>
			{/* Semi-transparent gradient background */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

			{/* Comment bubbles */}
			<div className="relative flex flex-col gap-1.5 px-3 pb-2">
				{comments.map((comment) => (
					<div
						key={comment.id}
						className="group animate-[comment-slide-up_6s_ease-out_forwards] flex items-start gap-2"
					>
						<div className="rounded-lg bg-black/[0.85] px-2.5 py-1.5 backdrop-blur-sm">
							<span className="text-[0.8125rem] text-cinema-muted md:text-sm">
								{comment.display_name || "Anonymous"}
							</span>
							<span className="ml-2 text-[0.8125rem] text-white md:text-sm">
								{comment.content}
							</span>
						</div>
						<div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
							<ReportButton
								contentType="comment"
								contentId={comment.id}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
