import { SeriesCard } from "@/components/series/series-card";
import type { SeriesWithCreator } from "@/modules/content/types";

interface SeriesGridProps {
	series: SeriesWithCreator[];
}

export function SeriesGrid({ series }: SeriesGridProps) {
	if (series.length === 0) {
		return (
			<div className="mt-12 text-center">
				<p className="text-lg text-muted-foreground">No series found</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Try selecting a different genre or check back later.
				</p>
			</div>
		);
	}

	return (
		<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{series.map((s) => (
				<SeriesCard key={s.id} series={s} />
			))}
		</div>
	);
}
