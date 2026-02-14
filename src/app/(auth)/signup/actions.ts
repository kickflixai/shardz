"use server";

import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { signupSchema, type AuthFormState } from "@/lib/validations/auth";

export async function signup(
	_prevState: AuthFormState,
	formData: FormData,
): Promise<AuthFormState> {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const displayName = (formData.get("displayName") as string) || undefined;

	const result = signupSchema.safeParse({ email, password, displayName });

	if (!result.success) {
		return {
			values: { email, displayName: displayName ?? "" },
			errors: z.flattenError(result.error).fieldErrors,
			success: false,
		};
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.signUp({
		email: result.data.email,
		password: result.data.password,
		options: {
			data: { display_name: result.data.displayName },
			emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
		},
	});

	if (error) {
		return {
			values: { email, displayName: displayName ?? "" },
			errors: null,
			success: false,
			message: error.message,
		};
	}

	return {
		errors: null,
		success: true,
		message: "Check your email for a confirmation link.",
	};
}
