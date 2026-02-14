"use server";

import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import {
	episodeSchema,
	type CreatorFormState,
} from "@/lib/validations/creator";

/**
 * Create a new episode with "draft" status.
 *
 * Called from the episode upload form before the video upload step.
 * Returns the created episode ID on success for use with MuxUploader.
 */
export async function createEpisode(
	_prevState: CreatorFormState & { episodeId?: string },
	formData: FormData,
): Promise<CreatorFormState & { episodeId?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			errors: null,
			success: false,
			message: "You must be signed in",
		};
	}

	// Verify creator role
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (profile?.role !== "creator" && profile?.role !== "admin") {
		return {
			errors: null,
			success: false,
			message: "Creator access required",
		};
	}

	const seasonId = formData.get("seasonId") as string;
	const seriesId = formData.get("seriesId") as string;
	const episodeNumber = Number(formData.get("episodeNumber"));

	if (!seasonId || !seriesId || !episodeNumber) {
		return {
			errors: null,
			success: false,
			message: "Missing required parameters",
		};
	}

	// Verify the user owns this series
	const { data: series } = await supabase
		.from("series")
		.select("id, creator_id")
		.eq("id", seriesId)
		.single();

	if (!series || series.creator_id !== user.id) {
		return {
			errors: null,
			success: false,
			message: "Not authorized to add episodes to this series",
		};
	}

	const raw = {
		title: formData.get("title") as string,
		description: (formData.get("description") as string) || undefined,
		contentWarnings:
			(formData.get("contentWarnings") as string) || undefined,
	};

	const result = episodeSchema.safeParse(raw);

	if (!result.success) {
		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				contentWarnings: raw.contentWarnings ?? "",
			},
			errors: z.flattenError(result.error).fieldErrors,
			success: false,
		};
	}

	const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null;

	const { data: episode, error } = await supabase
		.from("episodes")
		.insert({
			season_id: seasonId,
			episode_number: episodeNumber,
			sort_order: episodeNumber,
			title: result.data.title,
			description: result.data.description || null,
			content_warnings: result.data.contentWarnings || null,
			thumbnail_url: thumbnailUrl,
			status: "draft",
		})
		.select("id")
		.single();

	if (error) {
		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				contentWarnings: raw.contentWarnings ?? "",
			},
			errors: null,
			success: false,
			message: "Failed to create episode. Please try again.",
		};
	}

	return {
		errors: null,
		success: true,
		episodeId: episode.id,
		message: "Episode created. Now upload your video.",
	};
}
