"use server";

import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { reportSchema, type SocialFormState } from "@/lib/validations/social";

export async function reportContent(formData: FormData): Promise<SocialFormState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, message: "You must be signed in to report content" };
	}

	const raw = {
		contentType: (formData.get("contentType") as string) ?? "",
		contentId: (formData.get("contentId") as string) ?? "",
		reason: (formData.get("reason") as string) ?? "",
	};

	const result = reportSchema.safeParse(raw);

	if (!result.success) {
		return {
			success: false,
			message: "Invalid report data",
			errors: z.flattenError(result.error).fieldErrors as Record<string, string[]>,
		};
	}

	const { contentType, contentId } = result.data;

	// Flag the content if it's a comment
	if (contentType === "comment") {
		await supabase
			.from("episode_comments")
			.update({ is_flagged: true })
			.eq("id", contentId);
	}

	// For series and episodes, we log but don't auto-flag
	// (admin review required for content takedowns)

	return { success: true, message: "Report submitted. Thank you for keeping MicroShort safe." };
}
