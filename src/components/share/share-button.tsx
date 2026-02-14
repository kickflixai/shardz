"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
	title: string;
	text: string;
	url: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
	async function handleShare() {
		const shareData = { title, text, url };

		if (navigator.share && navigator.canShare?.(shareData)) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				// User cancelled share -- not an error
				if ((err as Error).name !== "AbortError") {
					console.error("Share failed:", err);
				}
			}
		} else {
			// Fallback: copy link to clipboard
			await navigator.clipboard.writeText(url);
			toast.success("Link copied to clipboard");
		}
	}

	return (
		<Button variant="outline" size="sm" onClick={handleShare}>
			<Share2 className="mr-2 h-4 w-4" />
			Share
		</Button>
	);
}
