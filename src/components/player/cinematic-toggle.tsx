"use client";

import { Eye, EyeOff } from "lucide-react";

interface CinematicToggleProps {
	cinematicMode: boolean;
	onToggle: () => void;
}

/**
 * Toggle button for cinematic mode, positioned in the player controls area.
 * Shows Eye icon when social overlays are visible, EyeOff when cinematic mode is active.
 * Placed outside MuxPlayer shadow DOM, positioned absolutely to appear integrated.
 */
export function CinematicToggle({
	cinematicMode,
	onToggle,
}: CinematicToggleProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className="absolute bottom-12 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
			aria-label={cinematicMode ? "Show social" : "Cinematic mode"}
			title={cinematicMode ? "Show social" : "Cinematic mode"}
		>
			{cinematicMode ? (
				<EyeOff className="h-4 w-4" />
			) : (
				<Eye className="h-4 w-4" />
			)}
		</button>
	);
}
