"use server";

import { createClient } from "@/lib/supabase/server";

export async function recordWatchProgress(
	episodeId: string,
	progressSeconds: number,
	completed: boolean,
): Promise<void> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return;

	await supabase
		.from("watch_history")
		.upsert(
			{
				user_id: user.id,
				episode_id: episodeId,
				progress_seconds: progressSeconds,
				completed,
				last_watched_at: new Date().toISOString(),
			},
			{ onConflict: "user_id,episode_id" },
		);
}
