"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateFeaturedOrder } from "@/modules/admin/actions/homepage";

interface SortOrderInputProps {
	seriesId: string;
	currentOrder: number | null;
}

export function SortOrderInput({ seriesId, currentOrder }: SortOrderInputProps) {
	const [value, setValue] = useState(String(currentOrder ?? 0));
	const [isPending, startTransition] = useTransition();

	function handleSubmit() {
		const order = Number.parseInt(value, 10);
		if (Number.isNaN(order)) return;

		startTransition(async () => {
			const result = await updateFeaturedOrder(seriesId, order);
			if (result.success) {
				toast.success("Sort order updated");
			} else {
				toast.error(result.message ?? "Failed to update");
			}
		});
	}

	return (
		<input
			type="number"
			min={0}
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onBlur={handleSubmit}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					handleSubmit();
				}
			}}
			disabled={isPending}
			className="w-16 rounded border border-border bg-background px-2 py-1 text-center text-sm text-foreground disabled:opacity-50"
			aria-label="Sort order"
		/>
	);
}
