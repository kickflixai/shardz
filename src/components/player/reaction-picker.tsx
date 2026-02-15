"use client";

import { useState } from "react";
import { toast } from "sonner";
import { REACTION_EMOJIS } from "@/modules/social/constants";

interface ReactionPickerProps {
	onReact: (emoji: string) => void;
	disabled?: boolean;
}

/**
 * Floating circular button that expands into an emoji picker.
 * Positioned absolute bottom-right within the player container.
 * When disabled (unauthenticated), shows "Sign in to react" toast.
 */
export function ReactionPicker({ onReact, disabled }: ReactionPickerProps) {
	const [open, setOpen] = useState(false);

	const handleToggle = () => {
		if (disabled) {
			toast("Sign in to react");
			return;
		}
		setOpen((prev) => !prev);
	};

	const handleReact = (emoji: string) => {
		onReact(emoji);
		setOpen(false);
	};

	return (
		<div className="absolute bottom-20 right-3 z-40 flex flex-col items-center gap-2 pointer-events-auto md:bottom-24 md:right-4">
			{/* Emoji list */}
			{open && (
				<div className="flex flex-col items-center gap-1.5 transition-all duration-200 origin-bottom">
					{REACTION_EMOJIS.map((emoji) => (
						<button
							key={emoji}
							type="button"
							onClick={() => handleReact(emoji)}
							className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-xl md:text-2xl transition-transform duration-150 hover:scale-110 active:scale-95"
						>
							{emoji}
						</button>
					))}
				</div>
			)}

			{/* Trigger button */}
			<button
				type="button"
				onClick={handleToggle}
				className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-xl md:text-2xl transition-all duration-200 hover:bg-black/80 active:scale-95"
				aria-label={open ? "Close reaction picker" : "Open reaction picker"}
			>
				{open ? "\u2715" : "\uD83D\uDD25"}
			</button>
		</div>
	);
}
