"use client";

import { useActionState } from "react";
import { updatePassword } from "./actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { AuthFormState } from "@/lib/validations/auth";

const initialState: AuthFormState = {
	errors: null,
	success: false,
};

export default function ResetPasswordPage() {
	const [state, formAction, isPending] = useActionState(
		updatePassword,
		initialState,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Reset Password</CardTitle>
				<CardDescription>Enter your new password</CardDescription>
			</CardHeader>
			<CardContent>
				<form action={formAction} className="flex flex-col gap-4">
					{state.message && (
						<div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
							{state.message}
						</div>
					)}
					<Field>
						<FieldLabel htmlFor="password">New Password</FieldLabel>
						<Input
							id="password"
							type="password"
							name="password"
							required
							placeholder="At least 6 characters"
							autoComplete="new-password"
						/>
						{state.errors?.password && (
							<FieldError>{state.errors.password[0]}</FieldError>
						)}
					</Field>
					<Field>
						<FieldLabel htmlFor="confirmPassword">
							Confirm Password
						</FieldLabel>
						<Input
							id="confirmPassword"
							type="password"
							name="confirmPassword"
							required
							placeholder="Re-enter your new password"
							autoComplete="new-password"
						/>
						{state.errors?.confirmPassword && (
							<FieldError>{state.errors.confirmPassword[0]}</FieldError>
						)}
					</Field>
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? "Updating..." : "Update Password"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
