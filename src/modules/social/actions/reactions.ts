"use server";

import { createClient } from "@/lib/supabase/server";

export const REACTION_EMOJIS = ["\uD83D\uDD25", "\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDE2D", "\uD83D\uDE2E", "\uD83D\uDC4F", "\uD83D\uDCAF"] as const;

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export async function recordReaction(
	episodeId: string,
	timestampSeconds: number,
	emoji: string,
): Promise<void> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return;

	// Validate emoji is in the curated set
	if (!REACTION_EMOJIS.includes(emoji as ReactionEmoji)) {
		return;
	}

	await supabase.rpc("increment_reaction", {
		p_episode_id: episodeId,
		p_timestamp_seconds: timestampSeconds,
		p_emoji: emoji,
	});
}
