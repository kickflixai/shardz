"use server";

import { createClient } from "@/lib/supabase/server";
import {
	forgotPasswordSchema,
	type AuthFormState,
} from "@/lib/validations/auth";

export async function requestPasswordReset(
	_prevState: AuthFormState,
	formData: FormData,
): Promise<AuthFormState> {
	const email = formData.get("email") as string;

	const result = forgotPasswordSchema.safeParse({ email });

	if (!result.success) {
		return {
			values: { email },
			errors: { email: [result.error.issues[0].message] },
			success: false,
		};
	}

	const supabase = await createClient();
	await supabase.auth.resetPasswordForEmail(result.data.email, {
		redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/reset-password`,
	});

	// Always return success regardless of whether the email exists
	// This prevents email enumeration attacks
	return {
		errors: null,
		success: true,
		message:
			"If an account exists with this email, you will receive a password reset link.",
	};
}
