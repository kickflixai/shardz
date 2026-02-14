export default function AdminDashboardPage() {
	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
			<p className="mt-2 text-muted-foreground">
				Platform administration and moderation. Coming in Phase 7.
			</p>
			<div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{["Total Users", "Active Creators", "Published Series", "Revenue"].map((stat) => (
					<div
						key={stat}
						className="rounded-lg border border-border bg-card p-6"
					>
						<p className="text-sm text-muted-foreground">{stat}</p>
						<p className="mt-2 text-2xl font-bold text-foreground">--</p>
					</div>
				))}
			</div>
		</div>
	);
}
