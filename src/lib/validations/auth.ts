import { z } from "zod/v4";

export const loginSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(72, "Password must be at most 72 characters"),
	displayName: z
		.string()
		.min(2, "Display name must be at least 2 characters")
		.max(50, "Display name must be at most 50 characters")
		.optional(),
});

export const forgotPasswordSchema = z.object({
	email: z.email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(72, "Password must be at most 72 characters"),
		confirmPassword: z.string(),
	})
	.check((ctx) => {
		if (ctx.value.password !== ctx.value.confirmPassword) {
			ctx.issues.push({
				code: "custom",
				input: ctx.value.confirmPassword,
				message: "Passwords do not match",
				path: ["confirmPassword"],
			});
		}
	});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type AuthFormState = {
	values?: Record<string, string>;
	errors: Record<string, string[]> | null;
	success: boolean;
	message?: string;
};
