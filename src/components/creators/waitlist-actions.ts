"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type WaitlistState = {
	success: boolean;
	error: string | null;
	duplicate: boolean;
};

export async function joinWaitlist(
	_prev: WaitlistState,
	formData: FormData,
): Promise<WaitlistState> {
	const email = formData.get("email");
	const schema = z.object({
		email: z.email("Please enter a valid email address"),
	});

	const result = schema.safeParse({ email });
	if (!result.success) {
		return {
			success: false,
			error: result.error.issues[0]?.message ?? "Invalid email",
			duplicate: false,
		};
	}

	const supabase = await createClient();
	const { error } = await supabase
		.from("waitlist")
		.insert({ email: result.data.email, source: "creator_landing" });

	if (error) {
		// Handle unique constraint violation (duplicate email)
		if (error.code === "23505") {
			return {
				success: false,
				error: null,
				duplicate: true,
			};
		}
		return {
			success: false,
			error: "Something went wrong. Please try again.",
			duplicate: false,
		};
	}

	return { success: true, error: null, duplicate: false };
}
