"use client";

interface PlayerLayoutProps {
	children: React.ReactNode;
}

/**
 * Responsive container for the video player.
 *
 * Mobile (< md breakpoint): Full-width vertical player with 9:16 aspect ratio
 * filling the viewport height. This is the vertical-first viewing experience
 * optimized for short-form content.
 *
 * Desktop (>= md breakpoint): Theater mode with dark backdrop. The player
 * is centered at max 480px width, maintaining the 9:16 aspect ratio.
 * The surrounding dark area creates a cinematic viewing experience.
 */
export function PlayerLayout({ children }: PlayerLayoutProps) {
	return (
		<div className="bg-cinema-black md:flex md:min-h-[80vh] md:flex-col md:items-center md:pt-8">
			<div
				className="aspect-[9/16] w-full max-h-dvh bg-black md:max-w-[480px] md:max-h-[80vh] md:mx-auto md:rounded-lg md:overflow-hidden"
				onContextMenu={(e) => e.preventDefault()}
				style={{ userSelect: "none", WebkitUserSelect: "none" }}
			>
				{children}
			</div>
		</div>
	);
}
