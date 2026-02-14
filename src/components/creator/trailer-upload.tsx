"use client";

import { useState } from "react";
import MuxUploader from "@mux/mux-uploader-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface TrailerUploadProps {
	seriesId: string;
	currentTrailerUrl: string | null;
}

/**
 * Trailer upload component using Mux Direct Upload with public playback.
 *
 * Trailers are promotional content that can be embedded and shared
 * without signed tokens. Uses the /api/upload/trailer endpoint
 * which sets playback_policy: ["public"] and passthrough: `trailer_{seriesId}`.
 *
 * The Mux webhook handler distinguishes trailer uploads via the `trailer_`
 * passthrough prefix and automatically stores the playback ID on the series record.
 */
export function TrailerUpload({
	seriesId,
	currentTrailerUrl,
}: TrailerUploadProps) {
	const [showUploader, setShowUploader] = useState(false);
	const [uploadComplete, setUploadComplete] = useState(false);

	const hasTrailer = !!currentTrailerUrl;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-sm font-medium text-foreground">
						Series Trailer
					</h3>
					<p className="text-xs text-muted-foreground">
						{hasTrailer
							? "A trailer is attached to this series."
							: "Upload an optional promotional trailer for your series."}
					</p>
				</div>
				{!showUploader && !uploadComplete && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setShowUploader(true)}
					>
						{hasTrailer ? "Replace Trailer" : "Upload Trailer"}
					</Button>
				)}
			</div>

			{uploadComplete && (
				<div className="rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
					Trailer uploaded. It will be available once processing completes.
				</div>
			)}

			{showUploader && !uploadComplete && (
				<div className="space-y-2">
					<MuxUploader
						endpoint={async () => {
							const res = await fetch("/api/upload/trailer", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ seriesId }),
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
								"Trailer uploaded! Processing video...",
							);
							setUploadComplete(true);
							setShowUploader(false);
						}}
						onUploadError={() => {
							toast.error("Trailer upload failed. Please try again.");
						}}
					/>
					<button
						type="button"
						onClick={() => setShowUploader(false)}
						className="text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						Cancel
					</button>
				</div>
			)}
		</div>
	);
}
