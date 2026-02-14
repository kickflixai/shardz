import { mux } from "./client";

interface SignPlaybackTokenOptions {
	type?: "video" | "thumbnail" | "gif" | "storyboard";
	expiration?: string;
}

/**
 * Generate a signed JWT playback token for a Mux playback ID.
 *
 * Requires MUX_SIGNING_KEY and MUX_PRIVATE_KEY env vars to be set.
 * Default type is "video", default expiration is "2h" (covers binge sessions;
 * Mux validates the token on every HLS segment request).
 */
export async function signPlaybackToken(
	playbackId: string,
	options: SignPlaybackTokenOptions = {},
): Promise<string> {
	const { type = "video", expiration = "2h" } = options;

	return mux.jwt.signPlaybackId(playbackId, {
		type,
		expiration,
	});
}
