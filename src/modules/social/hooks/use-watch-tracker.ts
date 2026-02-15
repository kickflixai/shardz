"use client";

import { useRef, useEffect, useCallback } from "react";
import { recordWatchProgress } from "@/modules/social/actions/watch-history";

/** Throttle interval for recording watch progress (15 seconds) */
const THROTTLE_MS = 15_000;

interface UseWatchTrackerOptions {
	episodeId: string;
	isAuthenticated: boolean;
}

/**
 * Hook that records watch progress during video playback.
 *
 * Call `onTimeUpdate(currentTime)` from the player's timeupdate event.
 * Call `onEnded()` when the video finishes.
 *
 * Progress is recorded every 15 seconds via the recordWatchProgress server action.
 * Skips tracking for unauthenticated viewers.
 */
export function useWatchTracker({
	episodeId,
	isAuthenticated,
}: UseWatchTrackerOptions) {
	const lastRecordedRef = useRef<number>(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const currentTimeRef = useRef<number>(0);

	// Clear timer on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, []);

	const recordProgress = useCallback(
		(seconds: number, completed: boolean) => {
			if (!isAuthenticated) return;
			recordWatchProgress(episodeId, Math.floor(seconds), completed);
		},
		[episodeId, isAuthenticated],
	);

	const onTimeUpdate = useCallback(
		(currentTime: number) => {
			if (!isAuthenticated) return;

			currentTimeRef.current = currentTime;

			const now = Date.now();
			if (now - lastRecordedRef.current >= THROTTLE_MS) {
				lastRecordedRef.current = now;
				recordProgress(currentTime, false);
			}
		},
		[isAuthenticated, recordProgress],
	);

	const onEnded = useCallback(() => {
		if (!isAuthenticated) return;
		recordProgress(currentTimeRef.current, true);
	}, [isAuthenticated, recordProgress]);

	return { onTimeUpdate, onEnded };
}
