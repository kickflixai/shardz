"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { REACTION_EMOJIS } from "@/modules/social/constants";

interface Bubble {
	id: string;
	emoji: string;
	left: number; // percentage — constrained to right column (75-95)
	swayOffset: number; // horizontal sway in px
	scale: number; // 0.8-1.2 for natural variation
	duration: number; // seconds for float animation
}

interface ReactionEvent {
	emoji: string;
	timestamp: number;
}

const MAX_BUBBLES = 12;

export function useReactions(episodeId: string) {
	const channelRef = useRef<RealtimeChannel | null>(null);
	const [bubbles, setBubbles] = useState<Bubble[]>([]);

	const addBubble = useCallback((emoji: string) => {
		setBubbles((prev) => {
			const next = [
				...prev,
				{
					id: crypto.randomUUID(),
					emoji,
					// Right column: 75-92% with slight variation
					left: 75 + Math.random() * 17,
					// Gentle sway: -8 to +8 px
					swayOffset: (Math.random() - 0.5) * 16,
					// Natural size variation
					scale: 0.85 + Math.random() * 0.3,
					// Variable float duration: 2.5-3.5s
					duration: 2.5 + Math.random() * 1,
				},
			];
			return next.length > MAX_BUBBLES
				? next.slice(next.length - MAX_BUBBLES)
				: next;
		});
	}, []);

	const removeBubble = useCallback((id: string) => {
		setBubbles((prev) => prev.filter((b) => b.id !== id));
	}, []);

	// Live reactions via Supabase Realtime broadcast
	useEffect(() => {
		const supabase = createClient();
		const channel = supabase.channel(`reactions:${episodeId}`, {
			config: { broadcast: { self: true } },
		});

		channel.on("broadcast", { event: "reaction" }, (payload) => {
			const { emoji } = payload.payload as ReactionEvent;
			if (
				(REACTION_EMOJIS as readonly string[]).includes(emoji)
			) {
				addBubble(emoji);
			}
		});

		channel.subscribe();
		channelRef.current = channel;

		return () => {
			supabase.removeChannel(channel);
		};
	}, [episodeId, addBubble]);

	const sendReaction = useCallback(
		async (emoji: string, timestamp: number) => {
			await channelRef.current?.send({
				type: "broadcast",
				event: "reaction",
				payload: { emoji, timestamp },
			});
		},
		[],
	);

	return { bubbles, addBubble, removeBubble, sendReaction };
}
