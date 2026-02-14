import Link from "next/link";

export default function SignupPage() {
	return (
		<div className="rounded-lg border border-border bg-card p-8">
			<h1 className="text-2xl font-bold text-foreground">Create Account</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Join MicroShort as a viewer or creator. Coming in Phase 2.
			</p>
			<div className="mt-6 rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
				Registration will be implemented with Supabase Auth.
			</div>
			<p className="mt-4 text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link href="/login" className="text-primary hover:underline">
					Sign in
				</Link>
			</p>
		</div>
	);
}
