import Link from "next/link";

export default function LoginPage() {
	return (
		<div className="rounded-lg border border-border bg-card p-8">
			<h1 className="text-2xl font-bold text-foreground">Sign In</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Sign in to your MicroShort account. Coming in Phase 2.
			</p>
			<div className="mt-6 rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
				Authentication will be implemented with Supabase Auth.
			</div>
			<p className="mt-4 text-center text-sm text-muted-foreground">
				Don&apos;t have an account?{" "}
				<Link href="/signup" className="text-primary hover:underline">
					Sign up
				</Link>
			</p>
		</div>
	);
}
