"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "shardz:cinematic-mode";

export function useCinematicMode() {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === "true") setEnabled(true);
	}, []);

	const toggle = useCallback(() => {
		setEnabled((prev) => {
			const next = !prev;
			localStorage.setItem(STORAGE_KEY, String(next));
			return next;
		});
	}, []);

	return { cinematicMode: enabled, toggleCinematicMode: toggle };
}
