"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "./actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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

export default function ForgotPasswordPage() {
	const [state, formAction, isPending] = useActionState(
		requestPasswordReset,
		initialState,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Forgot Password</CardTitle>
				<CardDescription>
					Enter your email to receive a password reset link
				</CardDescription>
			</CardHeader>
			<CardContent>
				{state.success ? (
					<div className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
						{state.message}
					</div>
				) : (
					<form action={formAction} className="flex flex-col gap-4">
						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								name="email"
								required
								defaultValue={state.values?.email}
								placeholder="you@example.com"
								autoComplete="email"
							/>
							{state.errors?.email && (
								<FieldError>{state.errors.email[0]}</FieldError>
							)}
						</Field>
						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? "Sending..." : "Send Reset Link"}
						</Button>
					</form>
				)}
			</CardContent>
			<CardFooter>
				<p className="w-full text-center text-sm text-muted-foreground">
					Remember your password?{" "}
					<Link href="/login" className="text-primary hover:underline">
						Sign in
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
