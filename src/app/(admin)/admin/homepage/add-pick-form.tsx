"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addEditorialPick } from "@/modules/admin/actions/homepage";

interface SeriesOption {
	id: string;
	title: string;
}

const SECTIONS = [
	{ value: "featured", label: "Featured" },
	{ value: "trending", label: "Trending" },
	{ value: "new_releases", label: "New Releases" },
	{ value: "staff_picks", label: "Staff Picks" },
] as const;

interface AddPickFormProps {
	allSeries: SeriesOption[];
}

export function AddPickForm({ allSeries }: AddPickFormProps) {
	const [seriesId, setSeriesId] = useState("");
	const [section, setSection] = useState("trending");
	const [sortOrder, setSortOrder] = useState("0");
	const [isPending, startTransition] = useTransition();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!seriesId) {
			toast.error("Please select a series");
			return;
		}

		startTransition(async () => {
			const result = await addEditorialPick(seriesId, section, Number.parseInt(sortOrder, 10) || 0);

			if (result.success) {
				toast.success("Editorial pick added");
				setSeriesId("");
				setSortOrder("0");
			} else {
				toast.error(result.message ?? "Failed to add pick");
			}
		});
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
			<div className="flex-1 min-w-[200px]">
				<label htmlFor="pick-series" className="mb-1 block text-sm font-medium text-foreground">
					Series
				</label>
				<select
					id="pick-series"
					value={seriesId}
					onChange={(e) => setSeriesId(e.target.value)}
					disabled={isPending}
					className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
				>
					<option value="">Select a series...</option>
					{allSeries.map((s) => (
						<option key={s.id} value={s.id}>
							{s.title}
						</option>
					))}
				</select>
			</div>

			<div>
				<label htmlFor="pick-section" className="mb-1 block text-sm font-medium text-foreground">
					Section
				</label>
				<select
					id="pick-section"
					value={section}
					onChange={(e) => setSection(e.target.value)}
					disabled={isPending}
					className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
				>
					{SECTIONS.map((s) => (
						<option key={s.value} value={s.value}>
							{s.label}
						</option>
					))}
				</select>
			</div>

			<div>
				<label htmlFor="pick-order" className="mb-1 block text-sm font-medium text-foreground">
					Order
				</label>
				<input
					id="pick-order"
					type="number"
					min={0}
					value={sortOrder}
					onChange={(e) => setSortOrder(e.target.value)}
					disabled={isPending}
					className="w-20 rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
				/>
			</div>

			<Button type="submit" disabled={isPending} size="sm">
				{isPending ? "Adding..." : "Add Pick"}
			</Button>
		</form>
	);
}
