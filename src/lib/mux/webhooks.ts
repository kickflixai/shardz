import type { HeadersLike } from "@mux/mux-node/core";
import type { Webhooks } from "@mux/mux-node/resources/webhooks";
import { mux } from "./client";

// Re-export webhook event types for use in handlers
export type MuxWebhookEvent = Webhooks.UnwrapWebhookEvent;
export type VideoAssetReadyEvent = Webhooks.VideoAssetReadyWebhookEvent;
export type VideoAssetErroredEvent = Webhooks.VideoAssetErroredWebhookEvent;
export type VideoAssetTrackReadyEvent =
	Webhooks.VideoAssetTrackReadyWebhookEvent;

// Webhook event type constants
export const MUX_EVENTS = {
	VIDEO_ASSET_READY: "video.asset.ready",
	VIDEO_ASSET_ERRORED: "video.asset.errored",
	VIDEO_ASSET_TRACK_READY: "video.asset.track.ready",
} as const;

/**
 * Verify a Mux webhook signature and parse the event payload.
 * Uses the Mux SDK's built-in HMAC-SHA256 verification with timing-safe comparison.
 *
 * @throws {Error} If signature verification fails
 */
export function verifyAndParseWebhook(
	body: string,
	headers: HeadersLike,
): MuxWebhookEvent {
	return mux.webhooks.unwrap(body, headers);
}

/**
 * Verify a Mux webhook signature without parsing.
 * Throws if verification fails.
 */
export function verifyWebhookSignature(
	body: string,
	headers: HeadersLike,
): void {
	mux.webhooks.verifySignature(body, headers);
}
