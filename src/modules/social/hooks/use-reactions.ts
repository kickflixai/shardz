"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { REACTION_EMOJIS } from "@/modules/social/constants";

interface Bubble {
	id: string;
	emoji: string;
	left: number; // percentage 10-90
}

interface ReactionEvent {
	emoji: string;
	timestamp: number;
}

const MAX_BUBBLES = 20;

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
					left: Math.random() * 80 + 10,
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
