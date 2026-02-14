"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/stripe/prices";

interface UnlockButtonProps {
	seasonId: string;
	seriesSlug: string;
	priceCents: number;
	purchaseType: "single" | "bundle";
	label?: string;
}

export function UnlockButton({
	seasonId,
	seriesSlug,
	priceCents,
	purchaseType,
	label,
}: UnlockButtonProps) {
	const [loading, setLoading] = useState(false);

	const defaultLabel =
		purchaseType === "single"
			? `Unlock Season - ${formatPrice(priceCents)}`
			: `Unlock All Seasons - ${formatPrice(priceCents)}`;

	const displayLabel = label ?? defaultLabel;

	async function handleClick() {
		setLoading(true);

		try {
			const body =
				purchaseType === "single"
					? { seasonId, seriesSlug, purchaseType: "single" }
					: { seriesSlug, purchaseType: "bundle" };

			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (response.status === 401) {
				// Unauthenticated: redirect to login with return URL
				window.location.href = `/login?next=/series/${seriesSlug}`;
				return;
			}

			if (response.status === 409) {
				toast.success("You already own this!");
				setLoading(false);
				return;
			}

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.error || "Checkout failed");
			}

			const { url } = await response.json();
			if (url) {
				window.location.href = url;
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Something went wrong",
			);
			setLoading(false);
		}
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={loading}
			className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-yellow px-8 py-4 text-base font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
		>
			{loading ? (
				<>
					<Loader2 className="h-5 w-5 animate-spin" />
					Processing...
				</>
			) : (
				displayLabel
			)}
		</button>
	);
}
