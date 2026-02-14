import { createClient } from "@/lib/supabase/server";
import { signPlaybackToken } from "@/lib/mux/tokens";
import { VideoPlayer } from "./video-player";

interface VideoPlayerShellProps {
	episodeId: string;
	nextEpisodeUrl?: string;
	nextEpisodeTitle?: string;
}

/**
 * Server Component that fetches episode data from Supabase and generates
 * signed Mux playback tokens server-side. The signing key never reaches
 * the client -- only the time-limited JWT tokens are passed down.
 */
export async function VideoPlayerShell({
	episodeId,
	nextEpisodeUrl,
	nextEpisodeTitle,
}: VideoPlayerShellProps) {
	const supabase = await createClient();

	const { data: episode } = await supabase
		.from("episodes")
		.select("mux_playback_id, title, duration_seconds")
		.eq("id", episodeId)
		.single();

	if (!episode?.mux_playback_id) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-cinema-black text-cinema-muted">
				<p>Video not available</p>
			</div>
		);
	}

	// Generate signed tokens server-side (signing key never leaves server)
	const [playbackToken, thumbnailToken] = await Promise.all([
		signPlaybackToken(episode.mux_playback_id, {
			type: "video",
			expiration: "2h",
		}),
		signPlaybackToken(episode.mux_playback_id, {
			type: "thumbnail",
			expiration: "2h",
		}),
	]);

	return (
		<VideoPlayer
			playbackId={episode.mux_playback_id}
			playbackToken={playbackToken}
			thumbnailToken={thumbnailToken}
			title={episode.title}
			episodeId={episodeId}
			nextEpisodeUrl={nextEpisodeUrl}
			nextEpisodeTitle={nextEpisodeTitle}
		/>
	);
}
