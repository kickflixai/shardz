"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface AutoContinueProps {
	nextEpisodeUrl: string;
	nextEpisodeTitle?: string;
	countdownSeconds?: number;
	onCancel: () => void;
}

export function AutoContinue({
	nextEpisodeUrl,
	nextEpisodeTitle,
	countdownSeconds = 5,
	onCancel,
}: AutoContinueProps) {
	const router = useRouter();
	const [countdown, setCountdown] = useState(countdownSeconds);

	const navigateNow = useCallback(() => {
		router.push(nextEpisodeUrl);
	}, [router, nextEpisodeUrl]);

	useEffect(() => {
		if (countdown <= 0) {
			navigateNow();
			return;
		}

		const timer = setInterval(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [countdown, navigateNow]);

	// Calculate stroke-dashoffset for the countdown ring
	const radius = 36;
	const circumference = 2 * Math.PI * radius;
	const progress = countdown / countdownSeconds;
	const strokeDashoffset = circumference * (1 - progress);

	return (
		<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
			{/* Next episode label */}
			<p className="mb-2 text-sm font-medium uppercase tracking-widest text-cinema-muted">
				Next Episode
			</p>

			{nextEpisodeTitle && (
				<p className="mb-6 max-w-[80%] truncate text-center text-lg font-bold text-white">
					{nextEpisodeTitle}
				</p>
			)}

			{/* Countdown ring */}
			<div className="relative mb-8 flex h-24 w-24 items-center justify-center">
				<svg
					className="-rotate-90"
					width="96"
					height="96"
					viewBox="0 0 96 96"
				>
					{/* Background ring */}
					<circle
						cx="48"
						cy="48"
						r={radius}
						fill="none"
						stroke="rgba(255,255,255,0.15)"
						strokeWidth="4"
					/>
					{/* Animated ring */}
					<circle
						cx="48"
						cy="48"
						r={radius}
						fill="none"
						stroke="#facc15"
						strokeWidth="4"
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						style={{
							transition: "stroke-dashoffset 1s linear",
						}}
					/>
				</svg>
				<span className="absolute text-3xl font-bold text-white">
					{countdown}
				</span>
			</div>

			{/* Action buttons */}
			<div className="flex gap-4">
				<button
					type="button"
					onClick={navigateNow}
					className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Play Now
				</button>
				<button
					type="button"
					onClick={onCancel}
					className="rounded-md border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
				>
					Cancel
				</button>
			</div>
		</div>
	);
}
