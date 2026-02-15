"use client";

import { useState, useRef, useActionState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { postComment } from "@/modules/social/actions/comments";
import type { SocialFormState } from "@/lib/validations/social";

interface CommentInputProps {
	episodeId: string;
	onPause: () => void;
	onResume: () => void;
	getCurrentTimestamp: () => number;
	isAuthenticated: boolean;
}

const initialState: SocialFormState = { success: false, message: "" };

/**
 * Floating comment button and input panel.
 * Pauses video when opened, captures timestamp at that moment,
 * resumes playback after successful submission.
 */
export function CommentInput({
	episodeId,
	onPause,
	onResume,
	getCurrentTimestamp,
	isAuthenticated,
}: CommentInputProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [content, setContent] = useState("");
	const [capturedTimestamp, setCapturedTimestamp] = useState(0);
	const formRef = useRef<HTMLFormElement>(null);

	const handleAction = async (
		_prevState: SocialFormState,
		formData: FormData,
	): Promise<SocialFormState> => {
		const result = await postComment(formData);
		if (result.success) {
			toast.success("Comment posted");
			setContent("");
			setIsOpen(false);
			onResume();
		}
		return result;
	};

	const [state, formAction, isPending] = useActionState(
		handleAction,
		initialState,
	);

	const handleOpen = () => {
		if (!isAuthenticated) {
			router.push("/login?next=" + encodeURIComponent(window.location.pathname));
			return;
		}
		// Capture timestamp BEFORE pausing (at the moment input opens)
		const ts = getCurrentTimestamp();
		setCapturedTimestamp(ts);
		onPause();
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
		setContent("");
		onResume();
	};

	if (!isOpen) {
		return (
			<button
				type="button"
				onClick={handleOpen}
				className="absolute bottom-12 left-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
				aria-label="Post a comment"
			>
				<MessageCircle className="h-4.5 w-4.5" />
			</button>
		);
	}

	return (
		<div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-8">
			<form ref={formRef} action={formAction} className="flex flex-col gap-2">
				<input type="hidden" name="episodeId" value={episodeId} />
				<input
					type="hidden"
					name="timestampSeconds"
					value={capturedTimestamp}
				/>

				<div className="flex items-center gap-2">
					<input
						type="text"
						name="content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="Add a comment..."
						maxLength={300}
						autoFocus
						className="flex-1 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm text-white placeholder:text-cinema-muted focus:border-brand-yellow focus:outline-none"
						aria-label="Comment text"
					/>
					<button
						type="submit"
						disabled={isPending || content.trim().length === 0}
						className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-yellow text-cinema-black transition-colors hover:bg-brand-yellow-light disabled:opacity-50"
						aria-label="Send comment"
					>
						<Send className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={handleClose}
						className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
						aria-label="Cancel comment"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="flex items-center justify-between px-1">
					<span className="text-xs text-cinema-muted">
						{content.length}/300
					</span>
					{state.message && !state.success && (
						<span className="text-xs text-red-400">
							{state.message}
						</span>
					)}
				</div>
			</form>
		</div>
	);
}
