"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { commentSchema, type SocialFormState } from "@/lib/validations/social";
import { containsProfanity } from "@/lib/moderation/profanity";

// Spam detection: reject all-caps content > 10 chars, or 3+ repeated chars in a row
function isSpam(content: string): boolean {
	if (content.length > 10 && content === content.toUpperCase() && /[A-Z]/.test(content)) {
		return true;
	}
	if (/(.)\1{2,}/.test(content)) {
		return true;
	}
	return false;
}

export async function postComment(formData: FormData): Promise<SocialFormState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, message: "You must be signed in to comment" };
	}

	const episodeId = formData.get("episodeId") as string;
	if (!episodeId) {
		return { success: false, message: "Episode ID is required" };
	}

	const raw = {
		content: (formData.get("content") as string) ?? "",
		timestampSeconds: Number(formData.get("timestampSeconds") ?? 0),
	};

	const result = commentSchema.safeParse(raw);

	if (!result.success) {
		return {
			success: false,
			message: "Invalid comment",
			errors: z.flattenError(result.error).fieldErrors as Record<string, string[]>,
		};
	}

	const { content, timestampSeconds } = result.data;

	// Profanity check
	if (containsProfanity(content)) {
		return { success: false, message: "Comment contains inappropriate language" };
	}

	// Spam check
	if (isSpam(content)) {
		return { success: false, message: "Comment was flagged as spam. Please revise." };
	}

	const { error } = await supabase
		.from("episode_comments")
		.insert({
			episode_id: episodeId,
			user_id: user.id,
			content,
			timestamp_seconds: timestampSeconds,
		});

	if (error) {
		return { success: false, message: "Failed to post comment. Please try again." };
	}

	revalidatePath(`/series`);
	return { success: true, message: "Comment posted" };
}
