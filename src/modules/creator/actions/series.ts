"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import {
	seriesSchema,
	type CreatorFormState,
} from "@/lib/validations/creator";

/**
 * Generate a URL-safe slug from a title with a random hex suffix for uniqueness.
 * E.g. "My Great Series" -> "my-great-series-a3f9"
 */
function generateSlug(title: string): string {
	const base = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
	const suffix = Math.random().toString(16).slice(2, 6);
	return `${base}-${suffix}`;
}

/**
 * Create a new series.
 *
 * Auth check, verify creator/admin role, parse with seriesSchema,
 * generate unique slug, insert with status "draft".
 * On success: revalidatePath and redirect to series detail.
 */
export async function createSeries(
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

	const raw = {
		title: formData.get("title") as string,
		description: (formData.get("description") as string) || undefined,
		genre: formData.get("genre") as string,
	};

	const result = seriesSchema.safeParse(raw);

	if (!result.success) {
		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				genre: raw.genre ?? "",
			},
			errors: z.flattenError(result.error).fieldErrors,
			success: false,
		};
	}

	const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null;
	const slug = generateSlug(result.data.title);

	const { data: series, error } = await supabase
		.from("series")
		.insert({
			title: result.data.title,
			description: result.data.description || null,
			genre: result.data.genre,
			thumbnail_url: thumbnailUrl,
			slug,
			creator_id: user.id,
			status: "draft",
			is_featured: false,
		})
		.select("id")
		.single();

	if (error) {
		// If slug collision, try once more with a new suffix
		if (error.code === "23505" && error.message.includes("slug")) {
			const retrySlug = generateSlug(result.data.title);
			const { data: retrySeries, error: retryError } = await supabase
				.from("series")
				.insert({
					title: result.data.title,
					description: result.data.description || null,
					genre: result.data.genre,
					thumbnail_url: thumbnailUrl,
					slug: retrySlug,
					creator_id: user.id,
					status: "draft",
					is_featured: false,
				})
				.select("id")
				.single();

			if (retryError) {
				return {
					values: {
						title: raw.title ?? "",
						description: raw.description ?? "",
						genre: raw.genre ?? "",
					},
					errors: null,
					success: false,
					message: "Failed to create series. Please try again.",
				};
			}

			revalidatePath("/dashboard/series");
			redirect(`/dashboard/series/${retrySeries.id}`);
		}

		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				genre: raw.genre ?? "",
			},
			errors: null,
			success: false,
			message: "Failed to create series. Please try again.",
		};
	}

	revalidatePath("/dashboard/series");
	redirect(`/dashboard/series/${series.id}`);
}

/**
 * Update an existing series.
 *
 * Uses bind() to pass seriesId as first argument.
 * Auth + ownership check, parse with seriesSchema, update.
 */
export async function updateSeries(
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

	// Verify ownership
	const { data: existing } = await supabase
		.from("series")
		.select("id, creator_id")
		.eq("id", seriesId)
		.single();

	if (!existing || existing.creator_id !== user.id) {
		return {
			errors: null,
			success: false,
			message: "Not authorized to edit this series",
		};
	}

	const raw = {
		title: formData.get("title") as string,
		description: (formData.get("description") as string) || undefined,
		genre: formData.get("genre") as string,
	};

	const result = seriesSchema.safeParse(raw);

	if (!result.success) {
		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				genre: raw.genre ?? "",
			},
			errors: z.flattenError(result.error).fieldErrors,
			success: false,
		};
	}

	const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null;

	const updateData: Record<string, unknown> = {
		title: result.data.title,
		description: result.data.description || null,
		genre: result.data.genre,
	};

	// Only update thumbnail if provided (non-empty)
	if (thumbnailUrl) {
		updateData.thumbnail_url = thumbnailUrl;
	}

	const { error } = await supabase
		.from("series")
		.update(updateData)
		.eq("id", seriesId);

	if (error) {
		return {
			values: {
				title: raw.title ?? "",
				description: raw.description ?? "",
				genre: raw.genre ?? "",
			},
			errors: null,
			success: false,
			message: "Failed to update series. Please try again.",
		};
	}

	revalidatePath(`/dashboard/series/${seriesId}`);
	revalidatePath("/dashboard/series");
	return {
		errors: null,
		success: true,
		message: "Series updated successfully",
	};
}

/**
 * Delete a series.
 *
 * Auth + ownership check, delete (cascade handles seasons/episodes).
 */
export async function deleteSeries(
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

	// Verify ownership
	const { data: existing } = await supabase
		.from("series")
		.select("id, creator_id")
		.eq("id", seriesId)
		.single();

	if (!existing || existing.creator_id !== user.id) {
		return {
			errors: null,
			success: false,
			message: "Not authorized to delete this series",
		};
	}

	const { error } = await supabase
		.from("series")
		.delete()
		.eq("id", seriesId);

	if (error) {
		return {
			errors: null,
			success: false,
			message: "Failed to delete series. Please try again.",
		};
	}

	revalidatePath("/dashboard/series");
	redirect("/dashboard/series");
}
