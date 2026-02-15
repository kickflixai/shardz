"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type HomepageActionResult = {
	success: boolean;
	message?: string;
};

/**
 * Toggle a series' featured status and optionally set its sort order.
 */
export async function toggleFeatured(
	seriesId: string,
	featured: boolean,
	sortOrder?: number,
): Promise<HomepageActionResult> {
	await requireAdmin();
	const adminDb = createAdminClient();

	const { error } = await adminDb
		.from("series")
		.update({
			is_featured: featured,
			featured_sort_order: featured ? (sortOrder ?? 0) : null,
		})
		.eq("id", seriesId);

	if (error) {
		return { success: false, message: "Failed to update featured status" };
	}

	revalidatePath("/admin/homepage");
	revalidatePath("/");
	return { success: true };
}

/**
 * Update the display order of a featured series.
 */
export async function updateFeaturedOrder(
	seriesId: string,
	sortOrder: number,
): Promise<HomepageActionResult> {
	await requireAdmin();
	const adminDb = createAdminClient();

	const { error } = await adminDb
		.from("series")
		.update({ featured_sort_order: sortOrder })
		.eq("id", seriesId);

	if (error) {
		return { success: false, message: "Failed to update sort order" };
	}

	revalidatePath("/admin/homepage");
	revalidatePath("/");
	return { success: true };
}

/**
 * Add a series to an editorial pick section.
 * Handles duplicate gracefully via upsert on (series_id, section).
 */
export async function addEditorialPick(
	seriesId: string,
	section: string,
	sortOrder?: number,
): Promise<HomepageActionResult> {
	const { user } = await requireAdmin();
	const adminDb = createAdminClient();

	const { error } = await adminDb.from("editorial_picks").upsert(
		{
			series_id: seriesId,
			section,
			sort_order: sortOrder ?? 0,
			added_by: user.id,
		},
		{ onConflict: "series_id,section" },
	);

	if (error) {
		return { success: false, message: "Failed to add editorial pick" };
	}

	revalidatePath("/admin/homepage");
	revalidatePath("/");
	return { success: true };
}

/**
 * Remove an editorial pick by its ID.
 */
export async function removeEditorialPick(pickId: string): Promise<HomepageActionResult> {
	await requireAdmin();
	const adminDb = createAdminClient();

	const { error } = await adminDb.from("editorial_picks").delete().eq("id", pickId);

	if (error) {
		return { success: false, message: "Failed to remove editorial pick" };
	}

	revalidatePath("/admin/homepage");
	revalidatePath("/");
	return { success: true };
}
