"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type AuthFormState } from "@/lib/validations/auth";

export async function login(
	_prevState: AuthFormState,
	formData: FormData,
): Promise<AuthFormState> {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	const result = loginSchema.safeParse({ email, password });

	if (!result.success) {
		return {
			values: { email },
			errors: z.flattenError(result.error).fieldErrors,
			success: false,
		};
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword({
		email: result.data.email,
		password: result.data.password,
	});

	if (error) {
		return {
			values: { email },
			errors: null,
			success: false,
			message: "Invalid email or password",
		};
	}

	revalidatePath("/", "layout");
	redirect("/");
}
