"use client";

import { useEffect, useRef } from "react";
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";

/**
 * Hook that works around the iOS PWA video playback freeze bug.
 *
 * When a PWA is backgrounded on iOS and the user returns, video elements
 * can become stuck and refuse to play. This is a known WebKit bug
 * (bugs.webkit.org #211018) with no official fix.
 *
 * The workaround listens for `visibilitychange` events and forces a
 * video source reset (`video.load()` + `video.play()`) on resume.
 *
 * Only activates in iOS standalone (PWA) context.
 */
export function useIOSPWAVideoFix(
	playerRef: React.RefObject<MuxPlayerRefAttributes | null>,
) {
	const wasBackgrounded = useRef(false);

	useEffect(() => {
		// Only apply in iOS PWA (standalone) context
		const isIOSPWA =
			"standalone" in navigator &&
			(navigator as unknown as { standalone: boolean }).standalone === true;

		if (!isIOSPWA) return;

		function handleVisibilityChange() {
			if (document.hidden) {
				wasBackgrounded.current = true;
				return;
			}

			// Document became visible again after being backgrounded
			if (wasBackgrounded.current && playerRef.current) {
				wasBackgrounded.current = false;

				// Try to access the underlying media element via the Mux web component
				const mediaEl = (
					playerRef.current as unknown as {
						media?: { nativeEl?: HTMLVideoElement };
					}
				).media?.nativeEl;

				if (mediaEl) {
					const currentTime = mediaEl.currentTime;
					// Force source reset to recover from frozen state
					mediaEl.load();
					mediaEl.currentTime = currentTime;
					// .catch() handles autoplay policy -- user will need to tap
					// MuxPlayer's built-in play button if autoplay is blocked
					mediaEl.play().catch(() => {});
				} else {
					// Fallback: use MuxPlayer's own pause/play methods
					// if the native element is not directly accessible
					const player = playerRef.current as unknown as {
						pause?: () => void;
						play?: () => Promise<void>;
					};
					if (player.pause && player.play) {
						player.pause();
						setTimeout(() => {
							player.play?.().catch(() => {});
						}, 100);
					}
				}
			}
		}

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener(
				"visibilitychange",
				handleVisibilityChange,
			);
		};
	}, [playerRef]);
}
