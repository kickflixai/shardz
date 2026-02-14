"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import {
	resetPasswordSchema,
	type AuthFormState,
} from "@/lib/validations/auth";

export async function updatePassword(
	_prevState: AuthFormState,
	formData: FormData,
): Promise<AuthFormState> {
	const password = formData.get("password") as string;
	const confirmPassword = formData.get("confirmPassword") as string;

	const result = resetPasswordSchema.safeParse({ password, confirmPassword });

	if (!result.success) {
		return {
			errors: z.flattenError(result.error).fieldErrors,
			success: false,
		};
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.updateUser({
		password: result.data.password,
	});

	if (error) {
		return {
			errors: null,
			success: false,
			message: error.message,
		};
	}

	revalidatePath("/", "layout");
	redirect("/");
}
