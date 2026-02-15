"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { removeEditorialPick } from "@/modules/admin/actions/homepage";

interface RemovePickButtonProps {
	pickId: string;
}

export function RemovePickButton({ pickId }: RemovePickButtonProps) {
	const [isPending, startTransition] = useTransition();

	function handleRemove() {
		startTransition(async () => {
			const result = await removeEditorialPick(pickId);
			if (result.success) {
				toast.success("Pick removed");
			} else {
				toast.error(result.message ?? "Failed to remove");
			}
		});
	}

	return (
		<button
			type="button"
			onClick={handleRemove}
			disabled={isPending}
			className="text-sm text-red-500 hover:text-red-400 disabled:opacity-50"
		>
			{isPending ? "Removing..." : "Remove"}
		</button>
	);
}
