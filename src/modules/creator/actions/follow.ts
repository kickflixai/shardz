"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function followCreator(creatorId: string): Promise<void> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Insert follow relationship; on conflict (already following) do nothing
	await supabase
		.from("followers")
		.upsert(
			{ follower_id: user.id, creator_id: creatorId },
			{ onConflict: "follower_id,creator_id", ignoreDuplicates: true },
		);

	// Get creator username for path revalidation
	const { data: creator } = await supabase
		.from("profiles")
		.select("username")
		.eq("id", creatorId)
		.single();

	if (creator?.username) {
		revalidatePath(`/creator/${creator.username}`);
	}
}

export async function unfollowCreator(creatorId: string): Promise<void> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	await supabase
		.from("followers")
		.delete()
		.eq("follower_id", user.id)
		.eq("creator_id", creatorId);

	// Get creator username for path revalidation
	const { data: creator } = await supabase
		.from("profiles")
		.select("username")
		.eq("id", creatorId)
		.single();

	if (creator?.username) {
		revalidatePath(`/creator/${creator.username}`);
	}
}
