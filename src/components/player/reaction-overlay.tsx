"use client";

import { useEffect, useRef, useCallback } from "react";

interface Bubble {
	id: string;
	emoji: string;
	left: number;
	swayOffset: number;
	scale: number;
	duration: number;
}

interface ReactionEntry {
	emoji: string;
	count: number;
}

interface ReactionOverlayProps {
	bubbles: Bubble[];
	removeBubble: (id: string) => void;
	addBubble: (emoji: string) => void;
	accumulatedReactions: Record<number, ReactionEntry[]>;
	currentTime: number;
	isPlaying?: boolean;
}

/**
 * Floating emoji bubbles in a right-side column.
 * Renders live broadcast bubbles and replays accumulated reactions at their
 * original timestamps during playback. Pauses animations when video is paused.
 */
export function ReactionOverlay({
	bubbles,
	removeBubble,
	addBubble,
	accumulatedReactions,
	currentTime,
	isPlaying = true,
}: ReactionOverlayProps) {
	// Track which seconds have already been replayed to avoid duplicates
	const processedSeconds = useRef<Set<number>>(new Set());
	const prevTime = useRef<number>(-1);

	// Detect seeks: if currentTime jumps backwards, clear processed set
	useEffect(() => {
		const ts = Math.floor(currentTime);
		if (ts < prevTime.current - 1) {
			processedSeconds.current.clear();
		}
		prevTime.current = ts;
	}, [currentTime]);

	// Replay accumulated reactions at their original timestamps
	const replayReactions = useCallback(
		(ts: number) => {
			if (!isPlaying) return;
			if (processedSeconds.current.has(ts)) return;
			processedSeconds.current.add(ts);

			const entries = accumulatedReactions[ts];
			if (!entries) return;

			let delay = 0;
			for (const entry of entries) {
				// Cap per-emoji to avoid flooding — show max 3 per emoji type
				const spawnCount = Math.min(entry.count, 3);
				for (let i = 0; i < spawnCount; i++) {
					const emoji = entry.emoji;
					setTimeout(() => {
						addBubble(emoji);
					}, delay);
					delay += 200;
				}
			}
		},
		[accumulatedReactions, addBubble, isPlaying],
	);

	useEffect(() => {
		if (!isPlaying) return;
		const ts = Math.floor(currentTime);
		replayReactions(ts);
	}, [currentTime, replayReactions, isPlaying]);

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
			{bubbles.map((b) => (
				<span
					key={b.id}
					className="reaction-bubble"
					style={{
						left: `${b.left}%`,
						"--sway-offset": `${b.swayOffset}px`,
						"--bubble-scale": b.scale,
						"--bubble-duration": `${b.duration}s`,
						animationPlayState: isPlaying ? "running" : "paused",
					} as React.CSSProperties}
					onAnimationEnd={() => removeBubble(b.id)}
				>
					{b.emoji}
				</span>
			))}
		</div>
	);
}
