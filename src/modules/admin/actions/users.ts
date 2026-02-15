"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateUserRole(userId: string, newRole: "viewer" | "creator" | "admin") {
	await requireAdmin();
	const adminDb = createAdminClient();

	const { error } = await adminDb.from("profiles").update({ role: newRole }).eq("id", userId);

	if (error) {
		return { success: false, message: "Failed to update user role" };
	}

	revalidatePath("/admin/users");
	revalidatePath(`/admin/users/${userId}`);
	return { success: true, message: `Role updated to ${newRole}` };
}
