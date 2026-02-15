"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "./actions";
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

export default function LoginPage() {
	const [state, formAction, isPending] = useActionState(login, initialState);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Sign In</CardTitle>
				<CardDescription>Sign in to your Shardz account</CardDescription>
			</CardHeader>
			<CardContent>
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
							placeholder="Enter your password"
							autoComplete="current-password"
						/>
						{state.errors?.password && (
							<FieldError>{state.errors.password[0]}</FieldError>
						)}
					</Field>
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? "Signing in..." : "Sign In"}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="flex-col gap-2">
				<p className="text-center text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link href="/signup" className="text-primary hover:underline">
						Sign up
					</Link>
				</p>
				<Link
					href="/forgot-password"
					className="text-sm text-muted-foreground hover:text-primary"
				>
					Forgot password?
				</Link>
			</CardFooter>
		</Card>
	);
}
