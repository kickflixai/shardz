import Link from "next/link";

export default function AuthCodeErrorPage() {
	return (
		<div className="rounded-lg border border-border bg-card p-8 text-center">
			<h1 className="text-2xl font-bold text-foreground">
				Link Expired or Invalid
			</h1>
			<p className="mt-4 text-muted-foreground">
				The link you clicked has expired or is invalid. This can happen if:
			</p>
			<ul className="mt-4 space-y-2 text-left text-sm text-muted-foreground">
				<li>The link is more than 1 hour old</li>
				<li>The link has already been used</li>
				<li>The link was copied incorrectly</li>
			</ul>
			<div className="mt-8 flex flex-col gap-3">
				<Link
					href="/forgot-password"
					className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Request a New Link
				</Link>
				<Link
					href="/login"
					className="text-sm text-muted-foreground transition-colors hover:text-primary"
				>
					Back to Sign In
				</Link>
			</div>
		</div>
	);
}
