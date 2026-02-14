"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import type { CreatorFormState } from "@/lib/validations/creator";

const profileSchema = z.object({
	displayName: z
		.string()
		.min(2, "Display name must be at least 2 characters")
		.max(50, "Display name must be at most 50 characters"),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(30, "Username must be at most 30 characters")
		.regex(
			/^[a-zA-Z0-9-]+$/,
			"Username can only contain letters, numbers, and dashes",
		)
		.optional()
		.or(z.literal("")),
	bio: z
		.string()
		.max(500, "Bio must be at most 500 characters")
		.optional()
		.or(z.literal("")),
	twitter: z
		.union([z.url("Please enter a valid URL"), z.literal("")])
		.optional(),
	instagram: z
		.union([z.url("Please enter a valid URL"), z.literal("")])
		.optional(),
	youtube: z
		.union([z.url("Please enter a valid URL"), z.literal("")])
		.optional(),
	tiktok: z
		.union([z.url("Please enter a valid URL"), z.literal("")])
		.optional(),
});

export async function updateProfile(
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
			message: "You must be signed in to update your profile",
		};
	}

	const raw = {
		displayName: (formData.get("displayName") as string) ?? "",
		username: (formData.get("username") as string) ?? "",
		bio: (formData.get("bio") as string) ?? "",
		twitter: (formData.get("twitter") as string) ?? "",
		instagram: (formData.get("instagram") as string) ?? "",
		youtube: (formData.get("youtube") as string) ?? "",
		tiktok: (formData.get("tiktok") as string) ?? "",
	};

	const result = profileSchema.safeParse(raw);

	if (!result.success) {
		return {
			values: raw,
			errors: z.flattenError(result.error).fieldErrors,
			success: false,
		};
	}

	// If username changed, check uniqueness
	const newUsername = result.data.username || null;
	if (newUsername) {
		const { data: existing } = await supabase
			.from("profiles")
			.select("id")
			.eq("username", newUsername)
			.neq("id", user.id)
			.maybeSingle();

		if (existing) {
			return {
				values: raw,
				errors: {
					username: ["This username is already taken"],
				},
				success: false,
			};
		}
	}

	// Build social links JSONB
	const socialLinks: Record<string, string> = {};
	if (result.data.twitter) socialLinks["twitter.com"] = result.data.twitter;
	if (result.data.instagram)
		socialLinks["instagram.com"] = result.data.instagram;
	if (result.data.youtube) socialLinks["youtube.com"] = result.data.youtube;
	if (result.data.tiktok) socialLinks["tiktok.com"] = result.data.tiktok;

	// Get current username for revalidation
	const { data: currentProfile } = await supabase
		.from("profiles")
		.select("username")
		.eq("id", user.id)
		.single();

	const { error } = await supabase
		.from("profiles")
		.update({
			display_name: result.data.displayName,
			username: newUsername,
			bio: result.data.bio || null,
			social_links: socialLinks,
		})
		.eq("id", user.id);

	if (error) {
		// Handle unique constraint violation on username
		if (error.code === "23505" && error.message.includes("username")) {
			return {
				values: raw,
				errors: {
					username: ["This username is already taken"],
				},
				success: false,
			};
		}
		return {
			values: raw,
			errors: null,
			success: false,
			message: "Failed to update profile. Please try again.",
		};
	}

	// Revalidate both dashboard settings and public profile pages
	revalidatePath("/dashboard/settings");
	if (currentProfile?.username) {
		revalidatePath(`/creator/${currentProfile.username}`);
	}
	if (newUsername && newUsername !== currentProfile?.username) {
		revalidatePath(`/creator/${newUsername}`);
	}

	return {
		errors: null,
		success: true,
		message: "Profile updated successfully!",
	};
}
