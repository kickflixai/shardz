"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { submitApplication } from "@/modules/creator/actions/apply";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel, FieldDescription } from "@/components/ui/field";
import type { CreatorFormState } from "@/lib/validations/creator";

const initialState: CreatorFormState = {
	errors: null,
	success: false,
};

export function ApplicationForm() {
	const [state, formAction, isPending] = useActionState(
		submitApplication,
		initialState,
	);

	useEffect(() => {
		if (state.success && state.message) {
			toast.success(state.message);
		}
	}, [state.success, state.message]);

	if (state.success) {
		return (
			<div className="space-y-3 py-4">
				<div className="rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
					{state.message}
				</div>
				<p className="text-sm text-muted-foreground">
					We will review your application and notify you of our decision.
				</p>
			</div>
		);
	}

	return (
		<form action={formAction} className="flex flex-col gap-5">
			{state.message && !state.success && (
				<div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{state.message}
				</div>
			)}

			<Field>
				<FieldLabel htmlFor="displayName">Display Name</FieldLabel>
				<Input
					id="displayName"
					name="displayName"
					required
					minLength={2}
					maxLength={50}
					defaultValue={state.values?.displayName}
					placeholder="How viewers will see you"
				/>
				{state.errors?.displayName && (
					<FieldError>{state.errors.displayName[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="bio">Bio</FieldLabel>
				<FieldDescription>
					Tell us about yourself and your content style (20-500 characters)
				</FieldDescription>
				<Textarea
					id="bio"
					name="bio"
					required
					minLength={20}
					maxLength={500}
					rows={4}
					defaultValue={state.values?.bio}
					placeholder="I create short-form content about..."
				/>
				{state.errors?.bio && (
					<FieldError>{state.errors.bio[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="portfolioDescription">
					Portfolio Description
				</FieldLabel>
				<FieldDescription>
					Describe your previous work and what kind of content you plan to
					create (20-1000 characters)
				</FieldDescription>
				<Textarea
					id="portfolioDescription"
					name="portfolioDescription"
					required
					minLength={20}
					maxLength={1000}
					rows={4}
					defaultValue={state.values?.portfolioDescription}
					placeholder="My experience includes... I plan to create content about..."
				/>
				{state.errors?.portfolioDescription && (
					<FieldError>
						{state.errors.portfolioDescription[0]}
					</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="portfolioUrl">
					Portfolio URL{" "}
					<span className="text-muted-foreground font-normal">(optional)</span>
				</FieldLabel>
				<Input
					id="portfolioUrl"
					name="portfolioUrl"
					type="url"
					defaultValue={state.values?.portfolioUrl}
					placeholder="https://your-portfolio.com"
				/>
				{state.errors?.portfolioUrl && (
					<FieldError>{state.errors.portfolioUrl[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="socialLinks">
					Social Links{" "}
					<span className="text-muted-foreground font-normal">(optional)</span>
				</FieldLabel>
				<FieldDescription>
					Add your social media links, separated by commas
				</FieldDescription>
				<Textarea
					id="socialLinks"
					name="socialLinks"
					rows={2}
					defaultValue={state.values?.socialLinks}
					placeholder="https://youtube.com/@you, https://instagram.com/you"
				/>
				{state.errors?.socialLinks && (
					<FieldError>{state.errors.socialLinks[0]}</FieldError>
				)}
			</Field>

			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Submitting..." : "Submit Application"}
			</Button>
		</form>
	);
}
