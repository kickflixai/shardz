"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function archiveSeries(seriesId: string) {
	await requireAdmin();
	const adminDb = createAdminClient();

	const { error } = await adminDb.from("series").update({ status: "archived" }).eq("id", seriesId);

	if (error) {
		return { success: false, message: "Failed to archive series" };
	}

	revalidatePath("/admin/content");
	revalidatePath(`/admin/content/${seriesId}`);
	revalidatePath("/browse");
	return { success: true, message: "Series archived" };
}

export async function restoreSeries(seriesId: string) {
	await requireAdmin();
	const adminDb = createAdminClient();

	const { error } = await adminDb.from("series").update({ status: "draft" }).eq("id", seriesId);

	if (error) {
		return { success: false, message: "Failed to restore series" };
	}

	revalidatePath("/admin/content");
	revalidatePath(`/admin/content/${seriesId}`);
	revalidatePath("/browse");
	return { success: true, message: "Series restored to draft" };
}
