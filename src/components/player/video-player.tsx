"use client";

import MuxPlayer from "@mux/mux-player-react";
import type {
	MuxPlayerRefAttributes,
	MuxPlayerCSSProperties,
} from "@mux/mux-player-react";
import { useRef, useState, useCallback } from "react";
import { useIOSPWAVideoFix } from "./ios-pwa-fix";
import { AutoContinue } from "./auto-continue";
import { CommentOverlay } from "./comment-overlay";
import { CommentInput } from "./comment-input";
import { CinematicToggle } from "./cinematic-toggle";
import { ReactionOverlay } from "./reaction-overlay";
import { ReactionPicker } from "./reaction-picker";
import { useComments } from "@/modules/social/hooks/use-comments";
import type { CommentWithProfile } from "@/modules/social/hooks/use-comments";
import { useCinematicMode } from "@/modules/social/hooks/use-cinematic-mode";
import { useReactions } from "@/modules/social/hooks/use-reactions";
import { recordReaction } from "@/modules/social/actions/reactions";

interface ReactionEntry {
	emoji: string;
	count: number;
}

interface VideoPlayerProps {
	playbackId: string;
	playbackToken: string;
	thumbnailToken: string;
	title: string;
	episodeId: string;
	nextEpisodeUrl?: string;
	nextEpisodeTitle?: string;
	autoPlay?: boolean;
	onEnded?: () => void;
	comments?: Record<number, CommentWithProfile[]>;
	accumulatedReactions?: Record<number, ReactionEntry[]>;
	isAuthenticated?: boolean;
}

export function VideoPlayer({
	playbackId,
	playbackToken,
	thumbnailToken,
	title,
	episodeId,
	nextEpisodeUrl,
	nextEpisodeTitle,
	autoPlay,
	onEnded,
	comments = {},
	accumulatedReactions = {},
	isAuthenticated = false,
}: VideoPlayerProps) {
	const playerRef = useRef<MuxPlayerRefAttributes>(null);
	const [showAutoContinue, setShowAutoContinue] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);

	useIOSPWAVideoFix(playerRef);

	const { cinematicMode, toggleCinematicMode } = useCinematicMode();
	const { visibleComments } = useComments(comments, currentTime);
	const { bubbles, addBubble, removeBubble, sendReaction } =
		useReactions(episodeId);

	const handleEnded = () => {
		if (nextEpisodeUrl) {
			setShowAutoContinue(true);
		}
		onEnded?.();
	};

	const handleTimeUpdate = useCallback(() => {
		const time = playerRef.current?.currentTime ?? 0;
		setCurrentTime(Math.floor(time));
	}, []);

	const handlePause = useCallback(() => {
		playerRef.current?.pause();
	}, []);

	const handleResume = useCallback(() => {
		playerRef.current?.play();
	}, []);

	const getCurrentTimestamp = useCallback(() => {
		return Math.floor(playerRef.current?.currentTime ?? 0);
	}, []);

	const handleReact = useCallback(
		async (emoji: string) => {
			const ts = Math.floor(playerRef.current?.currentTime ?? 0);
			// Broadcast live reaction + record for accumulated playback
			sendReaction(emoji, ts);
			recordReaction(episodeId, ts, emoji);
		},
		[episodeId, sendReaction],
	);

	return (
		<div
			className="relative"
			onContextMenu={(e) => e.preventDefault()}
			style={{ width: "100%", height: "100%" }}
		>
			<MuxPlayer
				ref={playerRef}
				playbackId={playbackId}
				tokens={{ playback: playbackToken, thumbnail: thumbnailToken }}
				streamType="on-demand"
				metadata={{
					video_id: episodeId,
					video_title: title,
					player_name: "Shardz Player",
				}}
				primaryColor="#facc15"
				secondaryColor="rgba(0,0,0,0.7)"
				accentColor="#facc15"
				defaultHiddenCaptions={false}
				style={
					{
						"--media-object-fit": "contain",
						width: "100%",
						height: "100%",
					} satisfies MuxPlayerCSSProperties
				}
				autoPlay={autoPlay ? ("any" as const) : undefined}
				onEnded={handleEnded}
				onTimeUpdate={handleTimeUpdate}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
			/>

			{/* Social overlays — layered bottom to top by z-index */}

			{/* z-10: Comment overlay (bottom 25%) — hidden in cinematic mode */}
			<CommentOverlay
				comments={visibleComments}
				visible={!cinematicMode}
			/>

			{/* z-20/30: Reaction overlay (floating bubbles) — hidden in cinematic mode */}
			{!cinematicMode && (
				<ReactionOverlay
					bubbles={bubbles}
					removeBubble={removeBubble}
					addBubble={addBubble}
					accumulatedReactions={accumulatedReactions}
					currentTime={currentTime}
					isPlaying={isPlaying}
				/>
			)}

			{/* z-30: Cinematic mode toggle (bottom-right, above controls) */}
			<CinematicToggle
				cinematicMode={cinematicMode}
				onToggle={toggleCinematicMode}
			/>

			{/* z-40: Reaction picker (bottom-right, above cinematic toggle) — stays visible in cinematic mode */}
			<ReactionPicker
				onReact={handleReact}
				disabled={!isAuthenticated}
			/>

			{/* z-30: Comment input button (bottom-left) */}
			<CommentInput
				episodeId={episodeId}
				onPause={handlePause}
				onResume={handleResume}
				getCurrentTimestamp={getCurrentTimestamp}
				isAuthenticated={isAuthenticated}
			/>

			{/* z-50: AutoContinue overlay (when shown) */}
			{showAutoContinue && nextEpisodeUrl && (
				<AutoContinue
					nextEpisodeUrl={nextEpisodeUrl}
					nextEpisodeTitle={nextEpisodeTitle}
					onCancel={() => setShowAutoContinue(false)}
				/>
			)}
		</div>
	);
}
