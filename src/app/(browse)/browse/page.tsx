export default function BrowsePage() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-8">
			<h1 className="text-3xl font-bold text-foreground">Browse Series</h1>
			<p className="mt-2 text-muted-foreground">
				Discover microshort video series by genre. Coming in Phase 3.
			</p>
			<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{["Drama", "Comedy", "Thriller", "Sci-Fi", "Romance", "Horror"].map((genre) => (
					<div
						key={genre}
						className="rounded-lg border border-border bg-card p-6 text-center"
					>
						<p className="text-lg font-medium text-foreground">{genre}</p>
						<p className="mt-1 text-sm text-muted-foreground">Coming soon</p>
					</div>
				))}
			</div>
		</div>
	);
}
