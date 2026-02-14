"use client";

import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";
import { createSeries, updateSeries } from "@/modules/creator/actions/series";
import { ThumbnailUpload } from "./thumbnail-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Field,
	FieldError,
	FieldLabel,
	FieldDescription,
} from "@/components/ui/field";
import { GENRE_CONFIG, ALL_GENRES } from "@/config/genres";
import type { CreatorFormState } from "@/lib/validations/creator";

interface SeriesFormProps {
	mode: "create" | "edit";
	initialData?: {
		id: string;
		title: string;
		description: string | null;
		genre: string;
		thumbnail_url: string | null;
	};
}

const initialState: CreatorFormState = {
	errors: null,
	success: false,
};

/**
 * Series create/edit form.
 *
 * Client component with useActionState.
 * Fields: title, description, genre (select), thumbnail (ThumbnailUpload).
 * Hidden input for thumbnailUrl set by ThumbnailUpload callback.
 */
export function SeriesForm({ mode, initialData }: SeriesFormProps) {
	const action =
		mode === "edit" && initialData
			? updateSeries.bind(null, initialData.id)
			: createSeries;

	const [state, formAction, isPending] = useActionState(action, initialState);
	const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
		initialData?.thumbnail_url ?? null,
	);

	useEffect(() => {
		if (state.success && state.message) {
			toast.success(state.message);
		}
	}, [state.success, state.message]);

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<input type="hidden" name="thumbnailUrl" value={thumbnailUrl ?? ""} />

			{state.message && !state.success && (
				<div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{state.message}
				</div>
			)}

			{state.success && state.message && mode === "edit" && (
				<div className="rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
					{state.message}
				</div>
			)}

			<Field>
				<FieldLabel htmlFor="title">Title</FieldLabel>
				<Input
					id="title"
					name="title"
					required
					minLength={2}
					maxLength={100}
					defaultValue={
						state.values?.title ?? initialData?.title ?? ""
					}
					placeholder="Series title"
				/>
				{state.errors?.title && (
					<FieldError>{state.errors.title[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="description">
					Description{" "}
					<span className="font-normal text-muted-foreground">
						(optional)
					</span>
				</FieldLabel>
				<Textarea
					id="description"
					name="description"
					maxLength={2000}
					rows={4}
					defaultValue={
						state.values?.description ??
						initialData?.description ??
						""
					}
					placeholder="Describe your series..."
				/>
				{state.errors?.description && (
					<FieldError>{state.errors.description[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="genre">Genre</FieldLabel>
				<select
					id="genre"
					name="genre"
					required
					defaultValue={
						state.values?.genre ?? initialData?.genre ?? ""
					}
					className="border-input bg-transparent h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
				>
					<option value="" disabled>
						Select a genre
					</option>
					{ALL_GENRES.map((genre) => (
						<option key={genre} value={genre}>
							{GENRE_CONFIG[genre].label}
						</option>
					))}
				</select>
				{state.errors?.genre && (
					<FieldError>{state.errors.genre[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel>Thumbnail</FieldLabel>
				<FieldDescription>
					Upload a thumbnail image for your series (max 5MB)
				</FieldDescription>
				<ThumbnailUpload
					entityId={initialData?.id ?? "new-series"}
					currentUrl={thumbnailUrl}
					onUpload={setThumbnailUrl}
				/>
			</Field>

			<div className="flex items-center justify-end border-t border-border pt-5">
				<Button type="submit" disabled={isPending}>
					{isPending
						? mode === "create"
							? "Creating..."
							: "Saving..."
						: mode === "create"
							? "Create Series"
							: "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
