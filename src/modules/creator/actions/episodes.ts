"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { mux } from "@/lib/mux/client";
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

/**
 * Update an existing episode's metadata.
 *
 * Auth + ownership chain check (episode -> season -> series -> creator_id).
 * Updates: title, description, content_warnings, thumbnail_url.
 */
export async function updateEpisode(
	episodeId: string,
	_prevState: CreatorFormState,
	formData: FormData,
): Promise<CreatorFormState> {
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

	// Verify ownership chain: episode -> season -> series -> creator_id
	const { data: episode } = await supabase
		.from("episodes")
		.select("id, season_id, seasons!inner(series_id, series!inner(creator_id))")
		.eq("id", episodeId)
		.single();

	if (!episode) {
		return {
			errors: null,
			success: false,
			message: "Episode not found",
		};
	}

	const creatorId = (
		(episode.seasons as unknown as { series: { creator_id: string } }).series
	).creator_id;

	if (creatorId !== user.id) {
		return {
			errors: null,
			success: false,
			message: "Not authorized to edit this episode",
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

	const updateData: Record<string, unknown> = {
		title: result.data.title,
		description: result.data.description || null,
		content_warnings: result.data.contentWarnings || null,
	};

	if (thumbnailUrl) {
		updateData.thumbnail_url = thumbnailUrl;
	}

	const { error } = await supabase
		.from("episodes")
		.update(updateData)
		.eq("id", episodeId);

	if (error) {
		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				contentWarnings: raw.contentWarnings ?? "",
			},
			errors: null,
			success: false,
			message: "Failed to update episode. Please try again.",
		};
	}

	const seriesId = (
		(episode.seasons as unknown as { series_id: string })
	).series_id;

	revalidatePath(`/dashboard/series/${seriesId}/seasons/${episode.season_id}`);
	return {
		errors: null,
		success: true,
		message: "Episode updated successfully",
	};
}

/**
 * Delete an episode.
 *
 * Auth + ownership chain check. If episode has a mux_asset_id,
 * delete the Mux asset to free storage.
 */
export async function deleteEpisode(
	episodeId: string,
): Promise<CreatorFormState> {
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

	// Verify ownership chain
	const { data: episode } = await supabase
		.from("episodes")
		.select(
			"id, season_id, mux_asset_id, seasons!inner(series_id, series!inner(creator_id))",
		)
		.eq("id", episodeId)
		.single();

	if (!episode) {
		return {
			errors: null,
			success: false,
			message: "Episode not found",
		};
	}

	const creatorId = (
		(episode.seasons as unknown as { series: { creator_id: string } }).series
	).creator_id;

	if (creatorId !== user.id) {
		return {
			errors: null,
			success: false,
			message: "Not authorized to delete this episode",
		};
	}

	// Clean up Mux asset if exists
	if (episode.mux_asset_id) {
		try {
			await mux.video.assets.delete(episode.mux_asset_id);
		} catch {
			// Non-critical: Mux asset may already be deleted
		}
	}

	const { error } = await supabase
		.from("episodes")
		.delete()
		.eq("id", episodeId);

	if (error) {
		return {
			errors: null,
			success: false,
			message: "Failed to delete episode. Please try again.",
		};
	}

	const seriesId = (
		(episode.seasons as unknown as { series_id: string })
	).series_id;

	revalidatePath(`/dashboard/series/${seriesId}/seasons/${episode.season_id}`);
	return {
		errors: null,
		success: true,
		message: "Episode deleted successfully",
	};
}

/**
 * Reorder episodes within a season.
 *
 * Auth + ownership check. Updates sort_order for each episode
 * based on position in the ordered array. Does NOT mutate episode_number
 * to avoid unique constraint violations (Pitfall 5).
 */
export async function reorderEpisodes(
	seasonId: string,
	orderedIds: string[],
): Promise<CreatorFormState> {
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

	// Verify ownership chain: season -> series -> creator_id
	const { data: season } = await supabase
		.from("seasons")
		.select("id, series_id, series!inner(creator_id)")
		.eq("id", seasonId)
		.single();

	if (!season) {
		return {
			errors: null,
			success: false,
			message: "Season not found",
		};
	}

	const creatorId = (
		season.series as unknown as { creator_id: string }
	).creator_id;

	if (creatorId !== user.id) {
		return {
			errors: null,
			success: false,
			message: "Not authorized to reorder episodes in this season",
		};
	}

	// Batch update sort_order for each episode
	const updates = orderedIds.map((id, index) =>
		supabase
			.from("episodes")
			.update({ sort_order: index })
			.eq("id", id)
			.eq("season_id", seasonId),
	);

	const results = await Promise.all(updates);
	const failed = results.some((r) => r.error);

	if (failed) {
		return {
			errors: null,
			success: false,
			message: "Failed to reorder episodes. Please try again.",
		};
	}

	revalidatePath(
		`/dashboard/series/${season.series_id}/seasons/${seasonId}`,
	);
	return {
		errors: null,
		success: true,
		message: "Episodes reordered successfully",
	};
}
