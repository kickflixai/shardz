"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateViewerProfile } from "@/modules/social/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Field,
	FieldError,
	FieldLabel,
	FieldDescription,
} from "@/components/ui/field";
import type { SocialFormState } from "@/lib/validations/social";

interface ProfileSettingsFormProps {
	initialValues: {
		displayName: string;
		watchHistoryPublic: boolean;
	};
}

export function ProfileSettingsForm({
	initialValues,
}: ProfileSettingsFormProps) {
	const initialState: SocialFormState = {
		success: false,
		message: "",
	};

	const [state, formAction, isPending] = useActionState(
		async (_prevState: SocialFormState, formData: FormData) => {
			return updateViewerProfile(formData);
		},
		initialState,
	);

	useEffect(() => {
		if (state.message) {
			if (state.success) {
				toast.success(state.message);
			} else if (state.message.length > 0) {
				toast.error(state.message);
			}
		}
	}, [state.success, state.message]);

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
					defaultValue={initialValues.displayName}
					placeholder="How others will see you"
				/>
				{state.errors?.displayName && (
					<FieldError>{state.errors.displayName[0]}</FieldError>
				)}
			</Field>

			<Field orientation="horizontal">
				<div className="flex flex-1 items-center justify-between gap-4">
					<div>
						<FieldLabel htmlFor="watchHistoryPublic">
							Public Watch History
						</FieldLabel>
						<FieldDescription>
							Allow others to see your watch history on your
							public profile
						</FieldDescription>
					</div>
					<label className="relative inline-flex cursor-pointer items-center">
						<input
							type="checkbox"
							id="watchHistoryPublic"
							name="watchHistoryPublic"
							value="true"
							defaultChecked={initialValues.watchHistoryPublic}
							className="peer sr-only"
						/>
						<div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-primary/20" />
					</label>
				</div>
			</Field>

			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Saving..." : "Save Changes"}
			</Button>
		</form>
	);
}
