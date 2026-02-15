import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t border-border">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 text-sm text-muted-foreground md:flex-row md:justify-between">
				<p>&copy; {new Date().getFullYear()} Shardz. All rights reserved.</p>
				<nav className="flex gap-6">
					<Link href="/" className="transition-colors hover:text-foreground">
						Home
					</Link>
					<Link href="/browse" className="transition-colors hover:text-foreground">
						Browse
					</Link>
				</nav>
			</div>
		</footer>
	);
}
