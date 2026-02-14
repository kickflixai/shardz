"use client";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	return (
		<div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
			<h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
			<p className="max-w-md text-muted-foreground">
				{error.message || "An unexpected error occurred. Please try again."}
			</p>
			<button
				type="button"
				onClick={reset}
				className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Try again
			</button>
		</div>
	);
}
