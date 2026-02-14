import { getSeriesByGenre } from "@/modules/content/queries/get-series-by-genre";
import { GenreFilter } from "./genre-filter";
import { SeriesGrid } from "@/components/series/series-grid";

interface BrowsePageProps {
	searchParams: Promise<{ genre?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
	const { genre } = await searchParams;
	const series = await getSeriesByGenre(genre);

	return (
		<div className="mx-auto max-w-7xl px-4 py-8">
			<h1 className="text-3xl font-bold text-foreground">Browse Series</h1>
			<GenreFilter />
			<SeriesGrid series={series} />
		</div>
	);
}
