import Link from "next/link";

export default function Forbidden() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
				<h1 className="text-4xl font-bold text-destructive">403</h1>
				<h2 className="mt-2 text-xl font-semibold text-foreground">Forbidden</h2>
				<p className="mt-3 text-muted-foreground">
					You don&apos;t have permission to access the admin panel.
				</p>
				<Link
					href="/"
					className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
				>
					Return to Home
				</Link>
			</div>
		</div>
	);
}
