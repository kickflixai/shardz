"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema, type SocialFormState } from "@/lib/validations/social";

export async function updateViewerProfile(formData: FormData): Promise<SocialFormState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, message: "You must be signed in to update your profile" };
	}

	const raw = {
		displayName: (formData.get("displayName") as string) ?? "",
		watchHistoryPublic: formData.get("watchHistoryPublic") === "true",
	};

	const result = profileUpdateSchema.safeParse(raw);

	if (!result.success) {
		return {
			success: false,
			message: "Invalid profile data",
			errors: z.flattenError(result.error).fieldErrors as Record<string, string[]>,
		};
	}

	const { error } = await supabase
		.from("profiles")
		.update({
			display_name: result.data.displayName,
			watch_history_public: result.data.watchHistoryPublic ?? false,
		})
		.eq("id", user.id);

	if (error) {
		return { success: false, message: "Failed to update profile. Please try again." };
	}

	revalidatePath("/profile");
	revalidatePath("/profile/settings");
	return { success: true, message: "Profile updated successfully!" };
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadAvatar(formData: FormData): Promise<SocialFormState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, message: "You must be signed in to upload an avatar" };
	}

	const file = formData.get("avatar") as File | null;

	if (!file || file.size === 0) {
		return { success: false, message: "No file selected" };
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return { success: false, message: "File must be JPEG, PNG, or WebP" };
	}

	if (file.size > MAX_SIZE) {
		return { success: false, message: "File must be smaller than 2MB" };
	}

	const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
	const filePath = `${user.id}/avatar.${ext}`;

	const { error: uploadError } = await supabase.storage
		.from("avatars")
		.upload(filePath, file, { upsert: true });

	if (uploadError) {
		return { success: false, message: "Failed to upload avatar. Please try again." };
	}

	const { data: publicUrl } = supabase.storage
		.from("avatars")
		.getPublicUrl(filePath);

	const { error: updateError } = await supabase
		.from("profiles")
		.update({ avatar_url: publicUrl.publicUrl })
		.eq("id", user.id);

	if (updateError) {
		return { success: false, message: "Avatar uploaded but failed to update profile." };
	}

	revalidatePath("/profile");
	revalidatePath("/profile/settings");
	return { success: true, message: "Avatar updated successfully!" };
}
