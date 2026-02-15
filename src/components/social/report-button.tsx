"use client";

import { useTransition } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { reportContent } from "@/modules/social/actions/report";

interface ReportButtonProps {
	contentType: "comment" | "series" | "episode";
	contentId: string;
}

/**
 * Small flag icon button for reporting content.
 * Calls the reportContent server action and shows a toast confirmation.
 */
export function ReportButton({ contentType, contentId }: ReportButtonProps) {
	const [isPending, startTransition] = useTransition();

	const handleReport = () => {
		startTransition(async () => {
			const formData = new FormData();
			formData.append("contentType", contentType);
			formData.append("contentId", contentId);
			formData.append("reason", "Flagged by user via report button");
			const result = await reportContent(formData);
			if (result.success) {
				toast.success("Reported. We'll review this content.");
			} else {
				toast.error(result.message);
			}
		});
	};

	return (
		<button
			type="button"
			onClick={handleReport}
			disabled={isPending}
			className="flex h-6 w-6 items-center justify-center rounded text-cinema-muted transition-colors hover:text-red-400 disabled:opacity-50"
			aria-label="Report content"
			title="Report content"
		>
			<Flag className="h-3 w-3" />
		</button>
	);
}
