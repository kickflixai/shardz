import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Film } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCreatorSeries } from "@/modules/creator/queries/get-creator-series";
import { getGenreLabel } from "@/config/genres";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Genre, ContentStatus } from "@/db/types";

const statusColors: Record<ContentStatus, string> = {
	draft: "bg-muted text-muted-foreground",
	processing: "bg-yellow-500/10 text-yellow-600",
	ready: "bg-green-500/10 text-green-600",
	published: "bg-blue-500/10 text-blue-600",
	archived: "bg-muted text-muted-foreground",
};

/**
 * Series catalog page.
 *
 * Server component showing all of the creator's series in a grid.
 * Auth check, fetch series via getCreatorSeries, display as cards.
 */
export default async function SeriesListPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?next=/dashboard/series");
	}

	// Verify creator role
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (profile?.role !== "creator" && profile?.role !== "admin") {
		redirect("/dashboard/apply");
	}

	const series = await getCreatorSeries(user.id);

	return (
		<div className="py-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">My Series</h1>
					<p className="mt-1 text-muted-foreground">
						Manage your series catalog
					</p>
				</div>
				<Button asChild>
					<Link href="/dashboard/series/new">
						<Plus className="size-4" />
						New Series
					</Link>
				</Button>
			</div>

			{series.length === 0 ? (
				<div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-16 text-center">
					<Film className="size-12 text-muted-foreground" />
					<h2 className="mt-4 text-lg font-semibold text-foreground">
						No series yet
					</h2>
					<p className="mt-2 max-w-sm text-sm text-muted-foreground">
						Create your first series to start uploading episodes and
						building your catalog.
					</p>
					<Button asChild className="mt-6">
						<Link href="/dashboard/series/new">
							<Plus className="size-4" />
							Create Your First Series
						</Link>
					</Button>
				</div>
			) : (
				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{series.map((s) => (
						<Link
							key={s.id}
							href={`/dashboard/series/${s.id}`}
							className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
						>
							<div className="relative aspect-[3/4] bg-muted">
								{s.thumbnail_url ? (
									<Image
										src={s.thumbnail_url}
										alt={s.title}
										fill
										className="object-cover"
										unoptimized
									/>
								) : (
									<div className="flex h-full items-center justify-center">
										<Film className="size-8 text-muted-foreground" />
									</div>
								)}
							</div>
							<div className="p-4">
								<div className="flex items-start justify-between gap-2">
									<h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
										{s.title}
									</h3>
									<Badge
										variant="secondary"
										className={
											statusColors[s.status as ContentStatus] ?? ""
										}
									>
										{s.status}
									</Badge>
								</div>
								<div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
									<Badge variant="outline">
										{getGenreLabel(s.genre as Genre)}
									</Badge>
									<span>
										{s.season_count} season{s.season_count !== 1 ? "s" : ""}
									</span>
									<span>
										{s.episode_count} episode{s.episode_count !== 1 ? "s" : ""}
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
