import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getGenreLabel } from "@/config/genres";
import type { Genre } from "@/db/types";
import type {
	EditorialPickItem,
	FeaturedSeriesItem,
} from "@/modules/admin/queries/get-homepage-data";
import { getEditorialPicks, getFeaturedSeries } from "@/modules/admin/queries/get-homepage-data";

const SECTION_HEADINGS: Record<string, string> = {
	trending: "Trending Now",
	new_releases: "New Releases",
	staff_picks: "Staff Picks",
};

function FeaturedCard({ series }: { series: FeaturedSeriesItem }) {
	return (
		<Link
			href={`/series/${series.slug}`}
			className="group block overflow-hidden rounded-xl border border-border bg-card transition-transform hover:scale-[1.02]"
		>
			<div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
				{series.thumbnail_url ? (
					<Image
						src={series.thumbnail_url}
						alt={series.title}
						fill
						className="object-cover transition-transform group-hover:scale-105"
						unoptimized
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="opacity-40"
							aria-hidden="true"
						>
							<title>Video placeholder</title>
							<polygon points="6 3 20 12 6 21 6 3" />
						</svg>
					</div>
				)}
			</div>

			<div className="p-4">
				<h3 className="line-clamp-1 text-base font-semibold text-foreground">{series.title}</h3>

				<Badge variant="secondary" className="mt-2">
					{getGenreLabel(series.genre as Genre)}
				</Badge>

				{series.description && (
					<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{series.description}</p>
				)}

				<div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
					<span className="truncate">{series.profiles?.display_name ?? "Unknown"}</span>
					<span className="shrink-0 ml-2">{series.view_count.toLocaleString()} views</span>
				</div>
			</div>
		</Link>
	);
}

function PickCard({ pick }: { pick: EditorialPickItem }) {
	const { series } = pick;
	return (
		<Link
			href={`/series/${series.slug}`}
			className="group block min-w-[260px] snap-start overflow-hidden rounded-xl border border-border bg-card transition-transform hover:scale-[1.02]"
		>
			<div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
				{series.thumbnail_url ? (
					<Image
						src={series.thumbnail_url}
						alt={series.title}
						fill
						className="object-cover transition-transform group-hover:scale-105"
						unoptimized
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="36"
							height="36"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="opacity-40"
							aria-hidden="true"
						>
							<title>Video placeholder</title>
							<polygon points="6 3 20 12 6 21 6 3" />
						</svg>
					</div>
				)}
			</div>

			<div className="p-3">
				<h4 className="line-clamp-1 text-sm font-semibold text-foreground">{series.title}</h4>
				<div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
					<span className="truncate">{series.profiles?.display_name ?? "Unknown"}</span>
					<Badge variant="secondary" className="ml-2 text-xs">
						{getGenreLabel(series.genre as Genre)}
					</Badge>
				</div>
			</div>
		</Link>
	);
}

export default async function HomePage() {
	const [featured, allPicks] = await Promise.all([getFeaturedSeries(), getEditorialPicks()]);

	// Group editorial picks by section, excluding "featured" (shown in hero section)
	const picksBySection: Record<string, EditorialPickItem[]> = {};
	for (const pick of allPicks) {
		if (pick.section === "featured") continue;
		if (!picksBySection[pick.section]) {
			picksBySection[pick.section] = [];
		}
		picksBySection[pick.section].push(pick);
	}

	const hasContent = featured.length > 0 || Object.keys(picksBySection).length > 0;

	return (
		<div>
			{/* Hero section */}
			<section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/30 px-4 py-20 text-center sm:py-28">
				<div className="mx-auto max-w-3xl">
					<div className="mx-auto mb-6 flex justify-center">
						<Image
							src="/logo.png"
							alt="Shardz"
							width={64}
							height={64}
							className="drop-shadow-[0_0_20px_rgba(224,184,0,0.3)]"
							priority
						/>
					</div>
					<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
						Discover Shardz
					</h1>
					<p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
						Short-form series. Big stories. Watch free, unlock more.
					</p>
					<Link
						href="/browse"
						className="mt-8 inline-block rounded-md bg-primary px-8 py-3 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Browse Series
					</Link>
				</div>
			</section>

			{/* Featured Series */}
			{featured.length > 0 && (
				<section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<h2 className="text-2xl font-bold text-foreground sm:text-3xl">Featured</h2>
					<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{featured.map((series) => (
							<FeaturedCard key={series.id} series={series} />
						))}
					</div>
				</section>
			)}

			{/* Editorial Pick sections */}
			{Object.entries(SECTION_HEADINGS).map(([section, heading]) => {
				const picks = picksBySection[section];
				if (!picks || picks.length === 0) return null;
				return (
					<section key={section} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
						<h2 className="text-2xl font-bold text-foreground">{heading}</h2>
						<div className="mt-6 flex snap-x gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
							{picks.map((pick) => (
								<PickCard key={pick.id} pick={pick} />
							))}
						</div>
					</section>
				);
			})}

			{/* Empty state */}
			{!hasContent && (
				<section className="mx-auto max-w-3xl px-4 py-16 text-center">
					<p className="text-lg text-muted-foreground">
						Our curated collections are coming soon. Browse all available series to get started.
					</p>
					<Link
						href="/browse"
						className="mt-6 inline-block rounded-md border border-border px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
					>
						Browse All Series
					</Link>
				</section>
			)}

			{/* CTA section */}
			<section className="border-t border-border bg-muted/30 px-4 py-16 text-center">
				<div className="mx-auto max-w-2xl">
					<h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to create?</h2>
					<p className="mt-3 text-muted-foreground">
						Build your audience with short-form series. Apply to become a creator today.
					</p>
					<Link
						href="/dashboard"
						className="mt-6 inline-block rounded-md bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Get Started
					</Link>
				</div>
			</section>
		</div>
	);
}
