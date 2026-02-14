"use client";

import MuxPlayer from "@mux/mux-player-react";
import type {
	MuxPlayerRefAttributes,
	MuxPlayerCSSProperties,
} from "@mux/mux-player-react";
import { useRef } from "react";
import { useIOSPWAVideoFix } from "./ios-pwa-fix";

interface VideoPlayerProps {
	playbackId: string;
	playbackToken: string;
	thumbnailToken: string;
	title: string;
	episodeId: string;
	nextEpisodeUrl?: string;
	autoPlay?: boolean;
	onEnded?: () => void;
}

export function VideoPlayer({
	playbackId,
	playbackToken,
	thumbnailToken,
	title,
	episodeId,
	autoPlay,
	onEnded,
}: VideoPlayerProps) {
	const playerRef = useRef<MuxPlayerRefAttributes>(null);

	useIOSPWAVideoFix(playerRef);

	return (
		<div
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
				style={
					{
						"--media-object-fit": "contain",
						width: "100%",
						height: "100%",
					} satisfies MuxPlayerCSSProperties
				}
				autoPlay={autoPlay ? ("any" as const) : undefined}
				onEnded={onEnded}
			/>
		</div>
	);
}
