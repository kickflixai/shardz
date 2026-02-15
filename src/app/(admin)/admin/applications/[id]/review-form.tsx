"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { reviewApplication } from "@/modules/admin/actions/applications";

export function ApplicationReviewForm({ applicationId }: { applicationId: string }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [notes, setNotes] = useState("");

	function handleReview(decision: "approved" | "rejected") {
		startTransition(async () => {
			const result = await reviewApplication(applicationId, decision, notes || undefined);

			if (result.success) {
				toast.success(result.message);
				router.push("/admin/applications");
			} else {
				toast.error(result.message);
			}
		});
	}

	return (
		<div className="space-y-4">
			<Field>
				<FieldLabel htmlFor="reviewer-notes">
					Reviewer Notes <span className="font-normal text-muted-foreground">(optional)</span>
				</FieldLabel>
				<FieldDescription>
					Add feedback for the applicant. Required context for rejections.
				</FieldDescription>
				<Textarea
					id="reviewer-notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					rows={3}
					placeholder="Feedback for the applicant..."
					disabled={isPending}
				/>
			</Field>

			<div className="flex gap-3">
				<Button
					type="button"
					onClick={() => handleReview("approved")}
					disabled={isPending}
					className="bg-green-600 hover:bg-green-700 text-white"
				>
					{isPending ? "Processing..." : "Approve"}
				</Button>
				<Button
					type="button"
					variant="destructive"
					onClick={() => handleReview("rejected")}
					disabled={isPending}
				>
					{isPending ? "Processing..." : "Reject"}
				</Button>
			</div>
		</div>
	);
}
