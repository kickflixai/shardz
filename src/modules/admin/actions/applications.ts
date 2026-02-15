"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type ReviewResult = {
	success: boolean;
	message: string;
};

export async function reviewApplication(
	applicationId: string,
	decision: "approved" | "rejected",
	reviewerNotes?: string,
): Promise<ReviewResult> {
	const { user } = await requireAdmin();
	const adminDb = createAdminClient();

	// Fetch application -- only allow reviewing pending ones
	const { data: app } = await adminDb
		.from("creator_applications")
		.select("user_id, display_name, bio")
		.eq("id", applicationId)
		.eq("status", "pending")
		.single();

	if (!app) {
		return {
			success: false,
			message: "Application not found or already reviewed",
		};
	}

	// Update application status
	const { error: updateError } = await adminDb
		.from("creator_applications")
		.update({
			status: decision,
			reviewer_notes: reviewerNotes || null,
			reviewed_by: user.id,
			reviewed_at: new Date().toISOString(),
		})
		.eq("id", applicationId);

	if (updateError) {
		return {
			success: false,
			message: "Failed to update application status",
		};
	}

	// On approval, promote user to creator role
	if (decision === "approved") {
		const { error: profileError } = await adminDb
			.from("profiles")
			.update({
				role: "creator",
				display_name: app.display_name,
				bio: app.bio,
			})
			.eq("id", app.user_id);

		if (profileError) {
			return {
				success: false,
				message: "Application approved but failed to update user role. Please update manually.",
			};
		}
	}

	revalidatePath("/admin/applications");
	return { success: true, message: `Application ${decision}` };
}
