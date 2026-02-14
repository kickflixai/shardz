"use client";

import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";
import {
	createSeason,
	updateSeason,
} from "@/modules/creator/actions/seasons";
import { formatPrice } from "@/lib/stripe/prices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Field,
	FieldError,
	FieldLabel,
	FieldDescription,
} from "@/components/ui/field";
import type { CreatorFormState } from "@/lib/validations/creator";

interface PriceTierOption {
	id: string;
	label: string;
	priceCents: number;
}

interface SeasonFormProps {
	mode: "create" | "edit";
	seriesId: string;
	priceTiers: PriceTierOption[];
	initialData?: {
		id: string;
		title: string | null;
		description: string | null;
		priceTierId: string | null;
		releaseStrategy: string;
		dripIntervalDays: number | null;
	};
}

const initialState: CreatorFormState = {
	errors: null,
	success: false,
};

/**
 * Season create/edit form.
 *
 * Client component with useActionState.
 * Fields: title (optional), description (optional), priceTierId (select),
 * releaseStrategy (radio: all_at_once / drip), dripIntervalDays (conditional).
 */
export function SeasonForm({
	mode,
	seriesId,
	priceTiers,
	initialData,
}: SeasonFormProps) {
	const action =
		mode === "edit" && initialData
			? updateSeason.bind(null, initialData.id)
			: createSeason.bind(null, seriesId);

	const [state, formAction, isPending] = useActionState(action, initialState);
	const [releaseStrategy, setReleaseStrategy] = useState(
		initialData?.releaseStrategy ?? "all_at_once",
	);

	useEffect(() => {
		if (state.success && state.message) {
			toast.success(state.message);
		}
	}, [state.success, state.message]);

	return (
		<form action={formAction} className="flex flex-col gap-5">
			{state.message && !state.success && (
				<div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{state.message}
				</div>
			)}

			{state.success && state.message && mode === "edit" && (
				<div className="rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
					{state.message}
				</div>
			)}

			<Field>
				<FieldLabel htmlFor="title">
					Season Title{" "}
					<span className="font-normal text-muted-foreground">
						(optional)
					</span>
				</FieldLabel>
				<FieldDescription>
					Leave blank to use &ldquo;Season N&rdquo; as the default name
				</FieldDescription>
				<Input
					id="title"
					name="title"
					maxLength={100}
					defaultValue={
						state.values?.title ?? initialData?.title ?? ""
					}
					placeholder="e.g. Origins, The Beginning"
				/>
				{state.errors?.title && (
					<FieldError>{state.errors.title[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="description">
					Description{" "}
					<span className="font-normal text-muted-foreground">
						(optional)
					</span>
				</FieldLabel>
				<Textarea
					id="description"
					name="description"
					maxLength={2000}
					rows={3}
					defaultValue={
						state.values?.description ??
						initialData?.description ??
						""
					}
					placeholder="Describe this season..."
				/>
				{state.errors?.description && (
					<FieldError>{state.errors.description[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="priceTierId">Price Tier</FieldLabel>
				<FieldDescription>
					Set the price viewers will pay to unlock this season
				</FieldDescription>
				<select
					id="priceTierId"
					name="priceTierId"
					required
					defaultValue={
						state.values?.priceTierId ??
						initialData?.priceTierId ??
						""
					}
					className="border-input bg-transparent h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
				>
					<option value="" disabled>
						Select a price tier
					</option>
					{priceTiers.map((tier) => (
						<option key={tier.id} value={tier.id}>
							{tier.label} - {formatPrice(tier.priceCents)}
						</option>
					))}
				</select>
				{state.errors?.priceTierId && (
					<FieldError>{state.errors.priceTierId[0]}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel>Release Strategy</FieldLabel>
				<FieldDescription>
					How episodes will be released to viewers
				</FieldDescription>
				<div className="flex gap-4">
					<label className="flex items-center gap-2 text-sm cursor-pointer">
						<input
							type="radio"
							name="releaseStrategy"
							value="all_at_once"
							checked={releaseStrategy === "all_at_once"}
							onChange={() => setReleaseStrategy("all_at_once")}
							className="accent-primary"
						/>
						All at once
					</label>
					<label className="flex items-center gap-2 text-sm cursor-pointer">
						<input
							type="radio"
							name="releaseStrategy"
							value="drip"
							checked={releaseStrategy === "drip"}
							onChange={() => setReleaseStrategy("drip")}
							className="accent-primary"
						/>
						Drip release
					</label>
				</div>
				{state.errors?.releaseStrategy && (
					<FieldError>
						{state.errors.releaseStrategy[0]}
					</FieldError>
				)}
			</Field>

			{releaseStrategy === "drip" && (
				<Field>
					<FieldLabel htmlFor="dripIntervalDays">
						Release Interval (days)
					</FieldLabel>
					<FieldDescription>
						Number of days between episode releases (1-30)
					</FieldDescription>
					<Input
						id="dripIntervalDays"
						name="dripIntervalDays"
						type="number"
						min={1}
						max={30}
						defaultValue={
							initialData?.dripIntervalDays?.toString() ?? "7"
						}
					/>
				</Field>
			)}

			<div className="flex items-center justify-end border-t border-border pt-5">
				<Button type="submit" disabled={isPending}>
					{isPending
						? mode === "create"
							? "Creating..."
							: "Saving..."
						: mode === "create"
							? "Create Season"
							: "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
