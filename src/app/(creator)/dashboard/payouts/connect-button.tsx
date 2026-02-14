"use client";

import { useState } from "react";

interface ConnectButtonProps {
	label: string;
	className?: string;
}

/**
 * Client component button that calls /api/connect to initiate
 * Stripe Connect onboarding, then redirects to the Stripe-hosted
 * onboarding page.
 */
export function ConnectButton({ label, className = "" }: ConnectButtonProps) {
	const [loading, setLoading] = useState(false);

	async function handleConnect() {
		setLoading(true);
		try {
			const response = await fetch("/api/connect", { method: "POST" });
			const data = await response.json();

			if (data.url) {
				window.location.href = data.url;
			} else {
				console.error("[connect-button] No URL returned:", data);
				setLoading(false);
			}
		} catch (error) {
			console.error("[connect-button] Failed to initiate Connect:", error);
			setLoading(false);
		}
	}

	return (
		<button
			type="button"
			onClick={handleConnect}
			disabled={loading}
			className={`inline-flex items-center justify-center rounded-md bg-brand-yellow px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-brand-yellow-light disabled:opacity-50 ${className}`}
		>
			{loading ? "Redirecting..." : label}
		</button>
	);
}
