"use client";

import { useMemo } from "react";

export interface CommentWithProfile {
	id: string;
	content: string;
	timestamp_seconds: number;
	display_name: string;
	avatar_url: string | null;
	user_id: string;
}

/**
 * Hook managing visible comments based on current playback time.
 * Accepts pre-bucketed comments as Record<number, CommentWithProfile[]>
 * and returns the subset visible at the current timestamp.
 */
export function useComments(
	commentBuckets: Record<number, CommentWithProfile[]>,
	currentTime: number,
) {
	const bucketMap = useMemo(() => {
		const map = new Map<number, CommentWithProfile[]>();
		for (const [key, comments] of Object.entries(commentBuckets)) {
			map.set(Number(key), comments);
		}
		return map;
	}, [commentBuckets]);

	const totalComments = useMemo(() => {
		let count = 0;
		for (const comments of bucketMap.values()) {
			count += comments.length;
		}
		return count;
	}, [bucketMap]);

	const visibleComments = useMemo(() => {
		const ts = Math.floor(currentTime);
		const current = bucketMap.get(ts) ?? [];
		const prev = bucketMap.get(ts - 1) ?? [];

		// Merge and dedupe by id
		const seen = new Set<string>();
		const merged: CommentWithProfile[] = [];
		for (const comment of [...current, ...prev]) {
			if (!seen.has(comment.id)) {
				seen.add(comment.id);
				merged.push(comment);
			}
		}

		// Return max 5 visible comments (latest 5)
		return merged.slice(-5);
	}, [bucketMap, currentTime]);

	return { visibleComments, totalComments };
}
