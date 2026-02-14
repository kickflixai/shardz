"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MuxUploader from "@mux/mux-uploader-react";
import { toast } from "sonner";
import { createEpisode } from "@/modules/creator/actions/episodes";
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
import type { CreatorFormState } from "@/lib/validations/creator";

interface EpisodeUploadFormProps {
	seasonId: string;
	seriesId: string;
	nextEpisodeNumber: number;
}

type EpisodeFormState = CreatorFormState & { episodeId?: string };

const initialState: EpisodeFormState = {
	errors: null,
	success: false,
};

/**
 * Two-step episode upload form:
 * 1. Metadata entry (title, description, content warnings, thumbnail)
 * 2. Video upload via MuxUploader (appears after episode row is created)
 *
 * The MuxUploader endpoint function calls POST /api/upload which returns
 * a Mux Direct Upload URL. The browser uploads video directly to Mux CDN.
 */
export function EpisodeUploadForm({
	seasonId,
	seriesId,
	nextEpisodeNumber,
}: EpisodeUploadFormProps) {
	const router = useRouter();
	const [state, formAction, isPending] = useActionState(
		createEpisode,
		initialState,
	);
	const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

	useEffect(() => {
		if (state.success && state.message) {
			toast.success(state.message);
		}
	}, [state.success, state.message]);

	// Step 2: Video upload after episode row is created
	if (state.success && state.episodeId) {
		return (
			<div className="space-y-6">
				<div className="rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
					Episode metadata saved. Upload your video below.
				</div>

				<div className="space-y-2">
					<h3 className="text-lg font-medium">Upload Video</h3>
					<p className="text-sm text-muted-foreground">
						Drag and drop your video file or click to select. The
						video will upload directly to our CDN.
					</p>
				</div>

				<MuxUploader
					endpoint={async () => {
						const res = await fetch("/api/upload", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								episodeId: state.episodeId,
							}),
						});

						if (!res.ok) {
							const data = await res.json();
							throw new Error(
								data.error || "Failed to create upload",
							);
						}

						const data = await res.json();
						return data.url;
					}}
					onSuccess={() => {
						toast.success(
							"Upload complete! Processing video...",
						);
						router.push(
							`/dashboard/series/${seriesId}/seasons/${seasonId}`,
						);
					}}
					onUploadError={() => {
						toast.error("Upload failed. Please try again.");
					}}
				/>
			</div>
		);
	}

	// Step 1: Metadata entry form
	return (
		<form action={formAction} className="flex flex-col gap-5">
			<input type="hidden" name="seasonId" value={seasonId} />
			<input type="hidden" name="seriesId" value={seriesId} />
			<input
				type="hidden"
				name="episodeNumber"
				value={nextEpisodeNumber}
			/>
			<input type="hidden" name="thumbnailUrl" value={thumbnailUrl ?? ""} />

			{state.message && !state.success && (
				<div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{state.message}
				</div>
			)}

			<Field>
				<FieldLabel htmlFor="title">Episode Title</FieldLabel>
				<Input
					id="title"
					name="title"
					required
					minLength={1}
					maxLength={100}
					defaultValue={state.values?.title}
					placeholder="Episode title"
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
					rows={3}
					defaultValue={state.values?.description}
					placeholder="Brief description of the episode"
				/>
				{state.errors?.description && (
					<FieldError>{state.errors.description[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="contentWarnings">
					Content Warnings{" "}
					<span className="font-normal text-muted-foreground">
						(optional)
					</span>
				</FieldLabel>
				<FieldDescription>
					E.g. violence, language, flashing lights
				</FieldDescription>
				<Input
					id="contentWarnings"
					name="contentWarnings"
					maxLength={500}
					defaultValue={state.values?.contentWarnings}
					placeholder="violence, language"
				/>
				{state.errors?.contentWarnings && (
					<FieldError>{state.errors.contentWarnings[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel>Thumbnail</FieldLabel>
				<FieldDescription>
					Upload an image for the episode thumbnail (max 5MB)
				</FieldDescription>
				<ThumbnailUpload
					entityId={`episode-${seasonId}-${nextEpisodeNumber}`}
					currentUrl={thumbnailUrl}
					onUpload={setThumbnailUrl}
				/>
			</Field>

			<div className="flex items-center justify-between border-t border-border pt-5">
				<p className="text-sm text-muted-foreground">
					Episode {nextEpisodeNumber}
				</p>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Creating..." : "Save & Upload Video"}
				</Button>
			</div>
		</form>
	);
}
