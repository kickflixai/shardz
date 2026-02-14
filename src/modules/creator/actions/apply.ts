"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import {
	applicationSchema,
	type CreatorFormState,
} from "@/lib/validations/creator";

export async function submitApplication(
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
			message: "You must be signed in to apply",
		};
	}

	// Check for existing application (pending or approved)
	const { data: existingApp } = await supabase
		.from("creator_applications")
		.select("id, status")
		.eq("user_id", user.id)
		.single();

	if (existingApp) {
		if (existingApp.status === "pending") {
			return {
				errors: null,
				success: false,
				message: "You already have a pending application",
			};
		}
		if (existingApp.status === "approved") {
			return {
				errors: null,
				success: false,
				message: "Your application has already been approved",
			};
		}
		// If rejected, delete the old application so user can reapply
		await supabase
			.from("creator_applications")
			.delete()
			.eq("id", existingApp.id);
	}

	const raw = {
		displayName: formData.get("displayName") as string,
		bio: formData.get("bio") as string,
		portfolioUrl: formData.get("portfolioUrl") as string,
		portfolioDescription: formData.get("portfolioDescription") as string,
		socialLinks: formData.get("socialLinks") as string,
	};

	const result = applicationSchema.safeParse(raw);

	if (!result.success) {
		return {
			values: raw,
			errors: z.flattenError(result.error).fieldErrors,
			success: false,
		};
	}

	// Parse social links: accept comma-separated URLs or JSON
	let socialLinksObj: Record<string, string> = {};
	if (result.data.socialLinks) {
		try {
			socialLinksObj = JSON.parse(result.data.socialLinks);
		} catch {
			// Treat as comma-separated URLs
			const links = result.data.socialLinks
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
			for (const link of links) {
				try {
					const url = new URL(link);
					const hostname = url.hostname.replace("www.", "");
					socialLinksObj[hostname] = link;
				} catch {
					// Skip invalid URLs
				}
			}
		}
	}

	const { error } = await supabase.from("creator_applications").insert({
		user_id: user.id,
		display_name: result.data.displayName,
		bio: result.data.bio,
		portfolio_url: result.data.portfolioUrl || null,
		portfolio_description: result.data.portfolioDescription,
		social_links: socialLinksObj,
	});

	if (error) {
		return {
			values: raw,
			errors: null,
			success: false,
			message: "Failed to submit application. Please try again.",
		};
	}

	revalidatePath("/dashboard");
	return {
		errors: null,
		success: true,
		message: "Application submitted successfully! We will review it shortly.",
	};
}
