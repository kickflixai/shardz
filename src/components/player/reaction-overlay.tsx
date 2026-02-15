"use client";

import { useEffect, useRef, useCallback } from "react";

interface Bubble {
	id: string;
	emoji: string;
	left: number;
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
}

/**
 * Floating emoji bubbles layer with pool cap.
 * Renders live broadcast bubbles and replays accumulated reactions at their
 * original timestamps during playback.
 */
export function ReactionOverlay({
	bubbles,
	removeBubble,
	addBubble,
	accumulatedReactions,
	currentTime,
}: ReactionOverlayProps) {
	// Track which seconds have already been replayed to avoid duplicates
	const processedSeconds = useRef<Set<number>>(new Set());
	const prevTime = useRef<number>(-1);

	// Detect seeks: if currentTime jumps backwards, clear processed set
	useEffect(() => {
		const ts = Math.floor(currentTime);
		if (ts < prevTime.current - 1) {
			// Seek detected: clear processed seconds so reactions replay
			processedSeconds.current.clear();
		}
		prevTime.current = ts;
	}, [currentTime]);

	// Replay accumulated reactions at their original timestamps
	const replayReactions = useCallback(
		(ts: number) => {
			if (processedSeconds.current.has(ts)) return;
			processedSeconds.current.add(ts);

			const entries = accumulatedReactions[ts];
			if (!entries) return;

			let delay = 0;
			for (const entry of entries) {
				// Spawn bubbles based on count, staggered by 100ms each
				const spawnCount = Math.min(entry.count, 10); // cap per-emoji to avoid flooding
				for (let i = 0; i < spawnCount; i++) {
					const emoji = entry.emoji;
					setTimeout(() => {
						addBubble(emoji);
					}, delay);
					delay += 100;
				}
			}
		},
		[accumulatedReactions, addBubble],
	);

	useEffect(() => {
		const ts = Math.floor(currentTime);
		replayReactions(ts);
	}, [currentTime, replayReactions]);

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
			{bubbles.map((b) => (
				<span
					key={b.id}
					className="reaction-bubble"
					style={{ left: `${b.left}%` }}
					onAnimationEnd={() => removeBubble(b.id)}
				>
					{b.emoji}
				</span>
			))}
		</div>
	);
}
