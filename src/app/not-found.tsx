import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="text-6xl font-bold text-primary">404</h1>
			<h2 className="text-2xl font-semibold text-foreground">Page not found</h2>
			<p className="max-w-md text-muted-foreground">
				The page you&apos;re looking for doesn&apos;t exist or has been moved.
			</p>
			<Link
				href="/"
				className="mt-4 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Go home
			</Link>
		</div>
	);
}
