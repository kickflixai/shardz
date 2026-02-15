import Image from "next/image";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
	getAllSeriesForCuration,
	getEditorialPicksAdmin,
} from "@/modules/admin/queries/get-homepage-data";
import { AddPickForm } from "./add-pick-form";
import { FeaturedToggle } from "./featured-toggle";
import { RemovePickButton } from "./remove-pick-button";
import { SortOrderInput } from "./sort-order-input";

const SECTION_LABELS: Record<string, string> = {
	featured: "Featured",
	trending: "Trending",
	new_releases: "New Releases",
	staff_picks: "Staff Picks",
};

export default async function AdminHomepagePage() {
	await requireAdmin();

	const [allSeries, editorialPicks] = await Promise.all([
		getAllSeriesForCuration(),
		getEditorialPicksAdmin(),
	]);

	// Group editorial picks by section
	const picksBySection = editorialPicks.reduce<Record<string, typeof editorialPicks>>(
		(acc, pick) => {
			if (!acc[pick.section]) {
				acc[pick.section] = [];
			}
			acc[pick.section].push(pick);
			return acc;
		},
		{},
	);

	return (
		<div className="py-4">
			{/* Section 1: Featured Series */}
			<div>
				<h1 className="text-3xl font-bold text-foreground">Featured Series</h1>
				<p className="mt-2 text-muted-foreground">
					Toggle which series appear as featured on the homepage and set their display order.
				</p>

				<div className="mt-6 overflow-x-auto">
					<table className="w-full border-collapse">
						<thead>
							<tr className="border-b border-border text-left text-sm text-muted-foreground">
								<th className="pb-3 pr-4 font-medium">Series</th>
								<th className="pb-3 pr-4 font-medium">Creator</th>
								<th className="pb-3 pr-4 font-medium text-right">Views</th>
								<th className="pb-3 pr-4 font-medium text-center">Featured</th>
								<th className="pb-3 font-medium text-center">Order</th>
							</tr>
						</thead>
						<tbody>
							{allSeries.length === 0 ? (
								<tr>
									<td colSpan={5} className="py-8 text-center text-muted-foreground">
										No published series found.
									</td>
								</tr>
							) : (
								allSeries.map((series) => (
									<tr key={series.id} className="border-b border-border last:border-0">
										<td className="py-3 pr-4">
											<div className="flex items-center gap-3">
												{series.thumbnail_url ? (
													<Image
														src={series.thumbnail_url}
														alt=""
														width={64}
														height={40}
														className="h-10 w-16 rounded object-cover"
														unoptimized
													/>
												) : (
													<div className="flex h-10 w-16 items-center justify-center rounded bg-muted">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="16"
															height="16"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="1.5"
															className="text-muted-foreground"
															aria-hidden="true"
														>
															<title>No thumbnail</title>
															<polygon points="6 3 20 12 6 21 6 3" />
														</svg>
													</div>
												)}
												<span className="font-medium text-foreground">{series.title}</span>
											</div>
										</td>
										<td className="py-3 pr-4 text-sm text-muted-foreground">
											{series.profiles?.display_name ?? "Unknown"}
										</td>
										<td className="py-3 pr-4 text-right text-sm text-muted-foreground">
											{series.view_count.toLocaleString()}
										</td>
										<td className="py-3 pr-4 text-center">
											<FeaturedToggle seriesId={series.id} featured={series.is_featured} />
										</td>
										<td className="py-3 text-center">
											{series.is_featured ? (
												<SortOrderInput
													seriesId={series.id}
													currentOrder={series.featured_sort_order}
												/>
											) : (
												<span className="text-sm text-muted-foreground">--</span>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Section 2: Editorial Picks */}
			<div className="mt-12">
				<h2 className="text-2xl font-bold text-foreground">Editorial Picks</h2>
				<p className="mt-2 text-muted-foreground">
					Add series to curated sections for homepage display.
				</p>

				{/* Add pick form */}
				<div className="mt-6 rounded-lg border border-border bg-card p-4">
					<h3 className="mb-3 text-sm font-medium text-foreground">Add New Pick</h3>
					<AddPickForm allSeries={allSeries.map((s) => ({ id: s.id, title: s.title }))} />
				</div>

				{/* Existing picks by section */}
				<div className="mt-6 space-y-6">
					{Object.keys(SECTION_LABELS).map((section) => {
						const picks = picksBySection[section] ?? [];
						return (
							<div key={section}>
								<h3 className="text-lg font-semibold text-foreground">{SECTION_LABELS[section]}</h3>
								{picks.length === 0 ? (
									<p className="mt-2 text-sm text-muted-foreground">No picks in this section.</p>
								) : (
									<div className="mt-2 space-y-2">
										{picks.map((pick) => (
											<div
												key={pick.id}
												className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
											>
												<div className="flex items-center gap-3">
													<span className="text-sm font-medium text-muted-foreground">
														#{pick.sort_order}
													</span>
													<span className="font-medium text-foreground">
														{pick.series?.title ?? "Unknown"}
													</span>
												</div>
												<RemovePickButton pickId={pick.id} />
											</div>
										))}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
