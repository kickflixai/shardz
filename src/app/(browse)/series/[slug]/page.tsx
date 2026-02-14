interface SeriesPageProps {
	params: Promise<{ slug: string }>;
}

export default async function SeriesPage({ params }: SeriesPageProps) {
	const { slug } = await params;

	return (
		<div className="mx-auto max-w-7xl px-4 py-8">
			<h1 className="text-3xl font-bold text-foreground">
				Series: {slug.replace(/-/g, " ")}
			</h1>
			<p className="mt-2 text-muted-foreground">
				Series detail page. Coming in Phase 3.
			</p>
			<div className="mt-8 rounded-lg border border-border bg-card p-8 text-center">
				<p className="text-muted-foreground">
					Episode listing, trailer player, and purchase options will appear here.
				</p>
			</div>
		</div>
	);
}
