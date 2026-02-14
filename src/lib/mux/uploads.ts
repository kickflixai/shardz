import { mux } from "./client";

interface CreateUploadParams {
	episodeId: string;
	corsOrigin?: string;
}

/**
 * Create a Mux Direct Upload URL for browser-side video upload.
 *
 * The episodeId is stored in `passthrough` so the existing Mux webhook handler
 * (`src/app/api/webhooks/mux/route.ts`) can link the processed asset back to
 * the correct episode row automatically.
 *
 * @returns The direct upload URL string for use with MuxUploader's endpoint prop.
 */
export async function createDirectUpload({
	episodeId,
	corsOrigin,
}: CreateUploadParams): Promise<string> {
	const directUpload = await mux.video.uploads.create({
		cors_origin:
			corsOrigin || process.env.NEXT_PUBLIC_APP_URL || "*",
		new_asset_settings: {
			playback_policies: ["signed"],
			passthrough: episodeId,
			video_quality: "basic",
		},
	});

	return directUpload.url;
}
