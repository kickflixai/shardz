"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SocialFormState } from "@/lib/validations/social";

export async function toggleFavorite(seriesId: string): Promise<SocialFormState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, message: "You must be signed in to favorite a series" };
	}

	// Check if already favorited
	const { data: existing } = await supabase
		.from("favorites")
		.select("id")
		.eq("user_id", user.id)
		.eq("series_id", seriesId)
		.maybeSingle();

	if (existing) {
		// Unfavorite
		const { error } = await supabase
			.from("favorites")
			.delete()
			.eq("user_id", user.id)
			.eq("series_id", seriesId);

		if (error) {
			return { success: false, message: "Failed to remove from favorites" };
		}

		revalidatePath("/profile/favorites");
		return { success: true, message: "Removed from favorites" };
	}

	// Add favorite
	const { error } = await supabase
		.from("favorites")
		.insert({ user_id: user.id, series_id: seriesId });

	if (error) {
		return { success: false, message: "Failed to add to favorites" };
	}

	revalidatePath("/profile/favorites");
	return { success: true, message: "Added to favorites" };
}
