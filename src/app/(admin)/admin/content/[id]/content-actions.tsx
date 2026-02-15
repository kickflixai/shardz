"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { archiveSeries, restoreSeries } from "@/modules/admin/actions/content";

export function ContentActions({ seriesId, status }: { seriesId: string; status: string }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleArchive() {
		startTransition(async () => {
			const result = await archiveSeries(seriesId);
			if (result.success) {
				toast.success(result.message);
				router.refresh();
			} else {
				toast.error(result.message);
			}
		});
	}

	function handleRestore() {
		startTransition(async () => {
			const result = await restoreSeries(seriesId);
			if (result.success) {
				toast.success(result.message);
				router.refresh();
			} else {
				toast.error(result.message);
			}
		});
	}

	if (status === "archived") {
		return (
			<Button onClick={handleRestore} disabled={isPending} variant="outline">
				{isPending ? "Restoring..." : "Restore to Draft"}
			</Button>
		);
	}

	if (status === "published" || status === "draft") {
		return (
			<Button onClick={handleArchive} disabled={isPending} variant="destructive">
				{isPending ? "Archiving..." : "Archive Series"}
			</Button>
		);
	}

	return null;
}
