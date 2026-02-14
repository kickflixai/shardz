"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "./actions";
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

export default function SignupPage() {
	const [state, formAction, isPending] = useActionState(signup, initialState);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create Account</CardTitle>
				<CardDescription>
					Join MicroShort as a viewer or creator
				</CardDescription>
			</CardHeader>
			<CardContent>
				{state.success ? (
					<div className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
						{state.message}
					</div>
				) : (
					<form action={formAction} className="flex flex-col gap-4">
						{state.message && (
							<div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
								{state.message}
							</div>
						)}
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
						<Field>
							<FieldLabel htmlFor="password">Password</FieldLabel>
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
							<FieldLabel htmlFor="displayName">
								Display Name (optional)
							</FieldLabel>
							<Input
								id="displayName"
								type="text"
								name="displayName"
								defaultValue={state.values?.displayName}
								placeholder="How others will see you"
								autoComplete="name"
							/>
							{state.errors?.displayName && (
								<FieldError>{state.errors.displayName[0]}</FieldError>
							)}
						</Field>
						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? "Creating account..." : "Create Account"}
						</Button>
					</form>
				)}
			</CardContent>
			<CardFooter>
				<p className="w-full text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link href="/login" className="text-primary hover:underline">
						Sign in
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
