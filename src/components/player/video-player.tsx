"use client";

import MuxPlayer from "@mux/mux-player-react";
import type {
	MuxPlayerRefAttributes,
	MuxPlayerCSSProperties,
} from "@mux/mux-player-react";
import { useRef, useState } from "react";
import { useIOSPWAVideoFix } from "./ios-pwa-fix";
import { AutoContinue } from "./auto-continue";

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
}: VideoPlayerProps) {
	const playerRef = useRef<MuxPlayerRefAttributes>(null);
	const [showAutoContinue, setShowAutoContinue] = useState(false);

	useIOSPWAVideoFix(playerRef);

	const handleEnded = () => {
		if (nextEpisodeUrl) {
			setShowAutoContinue(true);
		}
		onEnded?.();
	};

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
					player_name: "MicroShort Player",
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
			/>

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
