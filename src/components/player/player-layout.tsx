"use client";

interface PlayerLayoutProps {
	children: React.ReactNode;
	sidebar?: React.ReactNode;
}

/**
 * Responsive container for the video player.
 *
 * Mobile (< md breakpoint): Full-width vertical player with 9:16 aspect ratio
 * filling the viewport height. Sidebar (if provided) renders below the player.
 *
 * Desktop (>= md breakpoint): Theater mode with dark backdrop. The player
 * is centered with the sidebar on the right when provided. Without a sidebar,
 * the player is centered at max 480px width.
 */
export function PlayerLayout({ children, sidebar }: PlayerLayoutProps) {
	if (sidebar) {
		return (
			<div className="bg-cinema-black md:flex md:min-h-[80vh] md:items-start md:justify-center md:gap-0 md:pt-8">
				{/* Player */}
				<div
					className="aspect-[9/16] w-full max-h-dvh bg-black md:max-w-[480px] md:max-h-[80vh] md:rounded-l-lg md:overflow-hidden"
					onContextMenu={(e) => e.preventDefault()}
					style={{ userSelect: "none", WebkitUserSelect: "none" }}
				>
					{children}
				</div>
				{/* Sidebar — hidden on mobile, shown on desktop */}
				<div className="hidden md:flex md:h-[80vh] md:max-h-[80vh] md:w-72 lg:w-80 md:flex-col md:rounded-r-lg md:border-l md:border-white/10 md:bg-cinema-surface/50 md:backdrop-blur-sm md:overflow-hidden">
					{sidebar}
				</div>
				{/* Sidebar on mobile — shown below the player */}
				<div className="md:hidden bg-cinema-surface/30 border-t border-white/10">
					{sidebar}
				</div>
			</div>
		);
	}

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
