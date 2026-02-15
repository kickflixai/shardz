"use client";

import { Player } from "@remotion/player";
import { useCallback } from "react";

type CompositionName = "player" | "browse" | "paywall" | "dashboard" | "social" | "formats" | "ai-tools";

const compositionMap: Record<
	CompositionName,
	{ width: number; height: number; duration: number }
> = {
	player: { width: 400, height: 700, duration: 540 },
	browse: { width: 1280, height: 720, duration: 390 },
	paywall: { width: 800, height: 600, duration: 360 },
	dashboard: { width: 1280, height: 720, duration: 420 },
	social: { width: 400, height: 700, duration: 420 },
	formats: { width: 1000, height: 600, duration: 390 },
	"ai-tools": { width: 1200, height: 700, duration: 420 },
};

/**
 * Client component wrapping Remotion Player for embedding animated compositions.
 * Uses lazyComponent with useCallback for code splitting.
 *
 * NOTE: If SSR issues occur, import this component via next/dynamic with ssr: false
 * in the parent server component.
 */
export function RemotionFeature({
	composition,
}: { composition: CompositionName }) {
	const config = compositionMap[composition];
	const lazyComponent = useCallback(
		() => import(`./remotion/${composition}-demo`),
		[composition],
	);

	return (
		<Player
			lazyComponent={lazyComponent}
			durationInFrames={config.duration}
			fps={30}
			compositionWidth={config.width}
			compositionHeight={config.height}
			style={{ width: "100%", borderRadius: 12 }}
			loop
			autoPlay
			controls={false}
		/>
	);
}

export type { CompositionName };
