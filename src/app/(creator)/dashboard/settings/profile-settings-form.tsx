"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/modules/creator/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Field,
	FieldError,
	FieldLabel,
	FieldDescription,
} from "@/components/ui/field";
import type { CreatorFormState } from "@/lib/validations/creator";

interface ProfileSettingsFormProps {
	initialValues: {
		displayName: string;
		username: string;
		bio: string;
		twitter: string;
		instagram: string;
		youtube: string;
		tiktok: string;
	};
}

export function ProfileSettingsForm({
	initialValues,
}: ProfileSettingsFormProps) {
	const initialState: CreatorFormState = {
		values: initialValues,
		errors: null,
		success: false,
	};

	const [state, formAction, isPending] = useActionState(
		updateProfile,
		initialState,
	);

	useEffect(() => {
		if (state.success && state.message) {
			toast.success(state.message);
		}
		if (!state.success && state.message) {
			toast.error(state.message);
		}
	}, [state.success, state.message]);

	// Use either the server-returned values or the initial values
	const values = state.values ?? initialValues;

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
					defaultValue={values.displayName}
					placeholder="How viewers will see you"
				/>
				{state.errors?.displayName && (
					<FieldError>{state.errors.displayName[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="username">Username</FieldLabel>
				<FieldDescription>
					Your profile URL: shardz.com/creator/
					{values.username || "your-username"}
				</FieldDescription>
				<Input
					id="username"
					name="username"
					minLength={3}
					maxLength={30}
					defaultValue={values.username}
					placeholder="your-username"
				/>
				{state.errors?.username && (
					<FieldError>{state.errors.username[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="bio">
					Bio{" "}
					<span className="font-normal text-muted-foreground">
						(optional)
					</span>
				</FieldLabel>
				<Textarea
					id="bio"
					name="bio"
					maxLength={500}
					rows={4}
					defaultValue={values.bio}
					placeholder="Tell viewers about yourself..."
				/>
				{state.errors?.bio && (
					<FieldError>{state.errors.bio[0]}</FieldError>
				)}
			</Field>

			{/* Social Links */}
			<div className="space-y-4">
				<div>
					<p className="text-sm font-medium">
						Social Links{" "}
						<span className="font-normal text-muted-foreground">
							(optional)
						</span>
					</p>
					<p className="text-sm text-muted-foreground">
						Add your social media profile URLs. These will appear on your
						public profile.
					</p>
				</div>

				<Field>
					<FieldLabel htmlFor="twitter">X (Twitter)</FieldLabel>
					<Input
						id="twitter"
						name="twitter"
						type="url"
						defaultValue={values.twitter}
						placeholder="https://x.com/yourhandle"
					/>
					{state.errors?.twitter && (
						<FieldError>{state.errors.twitter[0]}</FieldError>
					)}
				</Field>

				<Field>
					<FieldLabel htmlFor="instagram">Instagram</FieldLabel>
					<Input
						id="instagram"
						name="instagram"
						type="url"
						defaultValue={values.instagram}
						placeholder="https://instagram.com/yourhandle"
					/>
					{state.errors?.instagram && (
						<FieldError>{state.errors.instagram[0]}</FieldError>
					)}
				</Field>

				<Field>
					<FieldLabel htmlFor="youtube">YouTube</FieldLabel>
					<Input
						id="youtube"
						name="youtube"
						type="url"
						defaultValue={values.youtube}
						placeholder="https://youtube.com/@yourchannel"
					/>
					{state.errors?.youtube && (
						<FieldError>{state.errors.youtube[0]}</FieldError>
					)}
				</Field>

				<Field>
					<FieldLabel htmlFor="tiktok">TikTok</FieldLabel>
					<Input
						id="tiktok"
						name="tiktok"
						type="url"
						defaultValue={values.tiktok}
						placeholder="https://tiktok.com/@yourhandle"
					/>
					{state.errors?.tiktok && (
						<FieldError>{state.errors.tiktok[0]}</FieldError>
					)}
				</Field>
			</div>

			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Saving..." : "Save Changes"}
			</Button>
		</form>
	);
}
