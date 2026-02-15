"use server";

import { createClient } from "@/lib/supabase/server";
import { REACTION_EMOJIS } from "@/modules/social/constants";
import type { ReactionEmoji } from "@/modules/social/constants";

export { REACTION_EMOJIS, type ReactionEmoji };

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
