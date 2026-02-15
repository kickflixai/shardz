import { createClient } from "@/lib/supabase/server";
import { signPlaybackToken } from "@/lib/mux/tokens";
import { VideoPlayer } from "./video-player";
import type { CommentWithProfile } from "@/modules/social/hooks/use-comments";

interface ReactionEntry {
	emoji: string;
	count: number;
}

interface VideoPlayerShellProps {
	episodeId: string;
	nextEpisodeUrl?: string;
	nextEpisodeTitle?: string;
	comments?: Record<number, CommentWithProfile[]>;
	accumulatedReactions?: Record<number, ReactionEntry[]>;
	isAuthenticated?: boolean;
}

/**
 * Server Component that fetches episode data from Supabase and generates
 * signed Mux playback tokens server-side. The signing key never reaches
 * the client -- only the time-limited JWT tokens are passed down.
 *
 * Also forwards pre-bucketed comments, reactions, and auth state to the
 * client-side VideoPlayer for social engagement features.
 */
export async function VideoPlayerShell({
	episodeId,
	nextEpisodeUrl,
	nextEpisodeTitle,
	comments,
	accumulatedReactions,
	isAuthenticated,
}: VideoPlayerShellProps) {
	const supabase = await createClient();

	const { data: episode } = await supabase
		.from("episodes")
		.select("mux_playback_id, title, duration_seconds")
		.eq("id", episodeId)
		.single();

	if (!episode?.mux_playback_id) {
		return (
			<div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-cinema-black">
				{/* Ambient gradient background */}
				<div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 via-cinema-black to-white/5" />
				<div className="relative flex flex-col items-center gap-3">
					{/* Play button */}
					<div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-yellow/30 bg-brand-yellow/10 shadow-[0_0_20px_rgba(224,184,0,0.15)]">
						<svg
							className="ml-1 h-6 w-6 text-brand-yellow"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
						</svg>
					</div>
					{episode?.title && (
						<p className="text-sm font-semibold text-white/80">{episode.title}</p>
					)}
					<p className="text-xs text-white/40">Video processing — check back soon</p>
				</div>
				{/* Simulated progress bar */}
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
					<div className="h-full w-0 bg-brand-yellow/50" />
				</div>
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
			comments={comments}
			accumulatedReactions={accumulatedReactions}
			isAuthenticated={isAuthenticated}
		/>
	);
}
