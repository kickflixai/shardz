"use client";

import { useActionState, useState, useEffect } from "react";
import { createPoll } from "@/modules/creator/actions/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PollCreatorProps {
	seriesId: string;
	onComplete?: () => void;
}

const initialState = { success: false, message: undefined as string | undefined };

/**
 * Form component for creating polls with 2-6 options.
 * Calls the createPoll server action on submit.
 */
export function PollCreator({ seriesId, onComplete }: PollCreatorProps) {
	const createPollBound = createPoll.bind(null, seriesId);
	const [state, formAction, isPending] = useActionState(
		createPollBound,
		initialState,
	);
	const [optionCount, setOptionCount] = useState(2);

	useEffect(() => {
		if (state.success) {
			toast.success("Poll created");
			setOptionCount(2);
			onComplete?.();
		}
		if (state.message && !state.success) {
			toast.error(state.message);
		}
	}, [state, onComplete]);

	return (
		<form action={formAction} className="space-y-3">
			<Textarea
				name="content"
				placeholder="Ask the community a question..."
				rows={2}
				maxLength={1000}
				required
			/>

			<div className="space-y-2">
				<p className="text-sm font-medium text-foreground">
					Options ({optionCount}/6)
				</p>
				{Array.from({ length: optionCount }).map((_, i) => (
					<Input
						key={i}
						name={`option_${i}`}
						placeholder={`Option ${i + 1}`}
						required
						maxLength={200}
					/>
				))}

				{optionCount < 6 && (
					<button
						type="button"
						onClick={() => setOptionCount((c) => c + 1)}
						className="text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						+ Add option
					</button>
				)}

				{optionCount > 2 && (
					<button
						type="button"
						onClick={() => setOptionCount((c) => c - 1)}
						className="ml-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						- Remove last
					</button>
				)}
			</div>

			<div className="flex justify-end">
				<Button type="submit" size="sm" disabled={isPending}>
					{isPending ? "Creating..." : "Create Poll"}
				</Button>
			</div>
		</form>
	);
}
