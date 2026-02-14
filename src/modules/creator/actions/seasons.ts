"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import {
	seasonSchema,
	type CreatorFormState,
} from "@/lib/validations/creator";

/**
 * Create a new season for a series.
 *
 * Auth + series ownership check, parse with seasonSchema,
 * compute next season_number, set sort_order = season_number.
 * On success: redirect to season management page.
 */
export async function createSeason(
	seriesId: string,
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

	// Verify series ownership
	const { data: series } = await supabase
		.from("series")
		.select("id, creator_id")
		.eq("id", seriesId)
		.single();

	if (!series || series.creator_id !== user.id) {
		return {
			errors: null,
			success: false,
			message: "Not authorized to add seasons to this series",
		};
	}

	const raw = {
		title: (formData.get("title") as string) || undefined,
		description: (formData.get("description") as string) || undefined,
		priceTierId: formData.get("priceTierId") as string,
		releaseStrategy: formData.get("releaseStrategy") as string,
	};

	const result = seasonSchema.safeParse(raw);

	if (!result.success) {
		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				priceTierId: raw.priceTierId ?? "",
				releaseStrategy: raw.releaseStrategy ?? "",
			},
			errors: z.flattenError(result.error).fieldErrors,
			success: false,
		};
	}

	// Compute next season_number
	const { count } = await supabase
		.from("seasons")
		.select("id", { count: "exact", head: true })
		.eq("series_id", seriesId);

	const nextSeasonNumber = (count ?? 0) + 1;

	// Get price_cents from the selected price tier
	const { data: tier } = await supabase
		.from("price_tiers")
		.select("price_cents")
		.eq("id", result.data.priceTierId)
		.single();

	const dripIntervalDays =
		result.data.releaseStrategy === "drip"
			? Number(formData.get("dripIntervalDays")) || 7
			: null;

	const { data: season, error } = await supabase
		.from("seasons")
		.insert({
			series_id: seriesId,
			season_number: nextSeasonNumber,
			sort_order: nextSeasonNumber,
			title: result.data.title || null,
			description: result.data.description || null,
			price_tier_id: result.data.priceTierId,
			price_cents: tier?.price_cents ?? null,
			release_strategy: result.data.releaseStrategy,
			drip_interval_days: dripIntervalDays,
			status: "draft",
		})
		.select("id")
		.single();

	if (error) {
		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				priceTierId: raw.priceTierId ?? "",
				releaseStrategy: raw.releaseStrategy ?? "",
			},
			errors: null,
			success: false,
			message: "Failed to create season. Please try again.",
		};
	}

	revalidatePath(`/dashboard/series/${seriesId}`);
	redirect(`/dashboard/series/${seriesId}/seasons/${season.id}`);
}

/**
 * Update an existing season.
 *
 * Auth + ownership chain check (season -> series -> creator_id).
 */
export async function updateSeason(
	seasonId: string,
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

	// Verify ownership chain: season -> series -> creator_id
	const { data: season } = await supabase
		.from("seasons")
		.select("id, series_id, series!inner(creator_id)")
		.eq("id", seasonId)
		.single();

	if (
		!season ||
		(season.series as unknown as { creator_id: string }).creator_id !==
			user.id
	) {
		return {
			errors: null,
			success: false,
			message: "Not authorized to edit this season",
		};
	}

	const raw = {
		title: (formData.get("title") as string) || undefined,
		description: (formData.get("description") as string) || undefined,
		priceTierId: formData.get("priceTierId") as string,
		releaseStrategy: formData.get("releaseStrategy") as string,
	};

	const result = seasonSchema.safeParse(raw);

	if (!result.success) {
		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				priceTierId: raw.priceTierId ?? "",
				releaseStrategy: raw.releaseStrategy ?? "",
			},
			errors: z.flattenError(result.error).fieldErrors,
			success: false,
		};
	}

	// Get price_cents from the selected price tier
	const { data: tier } = await supabase
		.from("price_tiers")
		.select("price_cents")
		.eq("id", result.data.priceTierId)
		.single();

	const dripIntervalDays =
		result.data.releaseStrategy === "drip"
			? Number(formData.get("dripIntervalDays")) || 7
			: null;

	const { error } = await supabase
		.from("seasons")
		.update({
			title: result.data.title || null,
			description: result.data.description || null,
			price_tier_id: result.data.priceTierId,
			price_cents: tier?.price_cents ?? null,
			release_strategy: result.data.releaseStrategy,
			drip_interval_days: dripIntervalDays,
		})
		.eq("id", seasonId);

	if (error) {
		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				priceTierId: raw.priceTierId ?? "",
				releaseStrategy: raw.releaseStrategy ?? "",
			},
			errors: null,
			success: false,
			message: "Failed to update season. Please try again.",
		};
	}

	revalidatePath(`/dashboard/series/${season.series_id}/seasons/${seasonId}`);
	revalidatePath(`/dashboard/series/${season.series_id}`);
	return {
		errors: null,
		success: true,
		message: "Season updated successfully",
	};
}

/**
 * Delete a season.
 *
 * Auth + ownership chain check, delete (cascade handles episodes).
 */
export async function deleteSeason(
	seasonId: string,
	seriesId: string,
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
	const { data: season } = await supabase
		.from("seasons")
		.select("id, series_id, series!inner(creator_id)")
		.eq("id", seasonId)
		.single();

	if (
		!season ||
		(season.series as unknown as { creator_id: string }).creator_id !==
			user.id
	) {
		return {
			errors: null,
			success: false,
			message: "Not authorized to delete this season",
		};
	}

	const { error } = await supabase
		.from("seasons")
		.delete()
		.eq("id", seasonId);

	if (error) {
		return {
			errors: null,
			success: false,
			message: "Failed to delete season. Please try again.",
		};
	}

	revalidatePath(`/dashboard/series/${seriesId}`);
	redirect(`/dashboard/series/${seriesId}`);
}
