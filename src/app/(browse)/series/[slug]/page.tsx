import { notFound } from "next/navigation";
import { getSeriesBySlug } from "@/modules/content/queries/get-series-by-slug";
import { SeriesDetail } from "@/components/series/series-detail";

interface SeriesPageProps {
	params: Promise<{ slug: string }>;
}

export default async function SeriesPage({ params }: SeriesPageProps) {
	const { slug } = await params;
	const series = await getSeriesBySlug(slug);

	if (!series) {
		notFound();
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-8">
			<SeriesDetail series={series} />
		</div>
	);
}
