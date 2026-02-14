import Link from "next/link";

export default function HomePage() {
	return (
		<div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
			<h1 className="text-5xl font-bold text-primary sm:text-6xl">MicroShort</h1>
			<p className="mt-4 max-w-lg text-lg text-muted-foreground">
				Premium microshort video series. Discover cinematic stories told in minutes.
			</p>
			<Link
				href="/browse"
				className="mt-8 rounded-md bg-primary px-8 py-3 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Browse Series
			</Link>
		</div>
	);
}
