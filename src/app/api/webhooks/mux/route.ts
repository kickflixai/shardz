import { createAdminClient } from "@/lib/supabase/admin";
import {
	MUX_EVENTS,
	verifyAndParseWebhook,
	type VideoAssetReadyEvent,
	type VideoAssetErroredEvent,
} from "@/lib/mux/webhooks";

/**
 * Mux webhook endpoint.
 * Receives asset lifecycle events, verifies signatures via the Mux SDK,
 * and updates episode records in Supabase.
 *
 * Authentication: Mux webhook signature verification (not user auth).
 * This route must NOT be behind auth middleware.
 */
export async function POST(request: Request) {
	const body = await request.text();

	// Verify signature and parse event using Mux SDK
	// The SDK reads MUX_WEBHOOK_SECRET from env automatically.
	// Throws if signature is missing or invalid.
	let event;
	try {
		event = verifyAndParseWebhook(body, request.headers);
	} catch (error) {
		console.error("[mux-webhook] Signature verification failed:", error);
		return new Response("Invalid signature", { status: 401 });
	}

	const supabase = createAdminClient();

	switch (event.type) {
		case MUX_EVENTS.VIDEO_ASSET_READY: {
			const { data } = event as VideoAssetReadyEvent;
			const assetId = data.id;
			const playbackId = data.playback_ids?.[0]?.id;
			const duration = data.duration;
			const passthrough = data.passthrough;

			if (!passthrough) {
				console.warn(
					"[mux-webhook] video.asset.ready missing passthrough, skipping DB update",
				);
				break;
			}

			// Distinguish trailer uploads from episode uploads via passthrough prefix
			if (passthrough.startsWith("trailer_")) {
				const seriesId = passthrough.replace("trailer_", "");
				const trailerPlaybackId = playbackId
					? `mux:${playbackId}`
					: null;

				const { error } = await supabase
					.from("series")
					.update({ trailer_url: trailerPlaybackId })
					.eq("id", seriesId);

				if (error) {
					console.error(
						"[mux-webhook] Failed to update series trailer:",
						seriesId,
						error,
					);
				} else {
					console.log(
						"[mux-webhook] Trailer ready for series:",
						seriesId,
						"playbackId:",
						playbackId,
					);
				}
			} else {
				// Episode upload: passthrough is the episodeId
				const episodeId = passthrough;

				const { error } = await supabase
					.from("episodes")
					.update({
						mux_asset_id: assetId,
						mux_playback_id: playbackId ?? null,
						duration_seconds: duration
							? Math.round(duration)
							: null,
						status: "ready",
					})
					.eq("id", episodeId);

				if (error) {
					console.error(
						"[mux-webhook] Failed to update episode:",
						episodeId,
						error,
					);
				} else {
					console.log(
						"[mux-webhook] Episode ready:",
						episodeId,
						"asset:",
						assetId,
					);
				}
			}
			break;
		}

		case MUX_EVENTS.VIDEO_ASSET_ERRORED: {
			const { data } = event as VideoAssetErroredEvent;
			const episodeId = data.passthrough;
			console.error(
				"[mux-webhook] Asset encoding failed:",
				data.id,
				"errors:",
				data.errors,
			);

			if (episodeId) {
				await supabase
					.from("episodes")
					.update({ status: "draft" })
					.eq("id", episodeId);
			}
			break;
		}

		case MUX_EVENTS.VIDEO_ASSET_TRACK_READY: {
			// Captions/subtitles are now available for playback.
			// No DB update needed for v1 -- Mux serves captions directly from the asset.
			console.log("[mux-webhook] Track ready for asset");
			break;
		}

		default: {
			// Acknowledge unhandled event types gracefully
			console.log("[mux-webhook] Unhandled event type:", event.type);
		}
	}

	return new Response("OK", { status: 200 });
}
