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
		<>
			{/* Backdrop to close picker on outside tap */}
			{open && (
				<div
					className="absolute inset-0 z-[39] pointer-events-auto"
					onClick={() => setOpen(false)}
					onTouchEnd={(e) => {
						e.preventDefault();
						setOpen(false);
					}}
				/>
			)}
			<div className="absolute bottom-20 right-3 z-40 flex flex-col items-center gap-3 pointer-events-auto md:bottom-24 md:right-4">
				{/* Emoji list */}
				{open && (
					<div className="flex flex-col items-center gap-2 rounded-full bg-black/70 backdrop-blur-md p-2">
						{REACTION_EMOJIS.map((emoji) => (
							<button
								key={emoji}
								type="button"
								onPointerDown={(e) => {
									e.stopPropagation();
									e.preventDefault();
									handleReact(emoji);
								}}
								className="w-12 h-12 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-white/20 text-2xl md:text-2xl transition-transform duration-150 hover:scale-110 active:scale-95 select-none"
							>
								{emoji}
							</button>
						))}
					</div>
				)}

				{/* Trigger button */}
				<button
					type="button"
					onPointerDown={(e) => {
						e.stopPropagation();
						e.preventDefault();
						handleToggle();
					}}
					className="w-12 h-12 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-2xl md:text-2xl transition-all duration-200 hover:bg-black/80 active:scale-95 select-none"
					aria-label={open ? "Close reaction picker" : "Open reaction picker"}
				>
					{open ? "\u2715" : "\uD83D\uDD25"}
				</button>
			</div>
		</>
	);
}
