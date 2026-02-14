import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteSeries } from "@/modules/creator/actions/series";
import { formatPrice } from "@/lib/stripe/prices";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeriesForm } from "@/components/creator/series-form";
import { TrailerUpload } from "@/components/creator/trailer-upload";
import type { ContentStatus, ReleaseStrategy } from "@/db/types";

interface SeriesDetailPageProps {
	params: Promise<{ seriesId: string }>;
}

const statusColors: Record<ContentStatus, string> = {
	draft: "bg-muted text-muted-foreground",
	processing: "bg-yellow-500/10 text-yellow-600",
	ready: "bg-green-500/10 text-green-600",
	published: "bg-blue-500/10 text-blue-600",
	archived: "bg-muted text-muted-foreground",
};

/**
 * Series detail/edit page.
 *
 * Server component: auth + ownership check, fetch series with seasons.
 * Shows SeriesForm in edit mode, season list, and management actions.
 */
export default async function SeriesDetailPage({
	params,
}: SeriesDetailPageProps) {
	const { seriesId } = await params;

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`/login?next=/dashboard/series/${seriesId}`);
	}

	// Fetch series with ownership check
	const { data: series } = await supabase
		.from("series")
		.select("id, title, description, genre, thumbnail_url, trailer_url, status, creator_id")
		.eq("id", seriesId)
		.single();

	if (!series || series.creator_id !== user.id) {
		redirect("/dashboard/series");
	}

	// Fetch seasons with episode counts
	const { data: seasons } = await supabase
		.from("seasons")
		.select(
			`
			id, season_number, title, description, status, price_cents,
			price_tier_id, release_strategy, drip_interval_days, sort_order,
			episodes(id)
		`,
		)
		.eq("series_id", seriesId)
		.order("sort_order", { ascending: true });

	const deleteAction = deleteSeries.bind(null, seriesId);

	return (
		<div className="mx-auto max-w-3xl py-8 space-y-8">
			{/* Edit Series */}
			<Card>
				<CardHeader>
					<CardTitle>Edit Series</CardTitle>
					<CardDescription>
						Update your series details
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SeriesForm
						mode="edit"
						initialData={{
							id: series.id,
							title: series.title,
							description: series.description,
							genre: series.genre,
							thumbnail_url: series.thumbnail_url,
						}}
					/>
				</CardContent>
			</Card>

			{/* Seasons List */}
			<Card>
				<CardHeader>
					<CardTitle>Seasons</CardTitle>
					<CardDescription>
						{seasons && seasons.length > 0
							? `${seasons.length} season${seasons.length !== 1 ? "s" : ""}`
							: "No seasons yet. Add your first season to start organizing episodes."}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{seasons?.map((season) => {
						const episodeCount = season.episodes?.length ?? 0;
						return (
							<Link
								key={season.id}
								href={`/dashboard/series/${seriesId}/seasons/${season.id}`}
								className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-card/80"
							>
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<span className="font-medium text-foreground">
											{season.title ||
												`Season ${season.season_number}`}
										</span>
										<Badge
											variant="secondary"
											className={
												statusColors[
													season.status as ContentStatus
												] ?? ""
											}
										>
											{season.status}
										</Badge>
									</div>
									<div className="flex items-center gap-3 text-sm text-muted-foreground">
										{season.price_cents !== null && (
											<span>
												{formatPrice(season.price_cents)}
											</span>
										)}
										<span>
											{(season.release_strategy as ReleaseStrategy) ===
											"drip"
												? `Drip (every ${season.drip_interval_days ?? 7}d)`
												: "All at once"}
										</span>
										<span>
											{episodeCount} episode
											{episodeCount !== 1 ? "s" : ""}
										</span>
									</div>
								</div>
								<svg
									className="size-5 text-muted-foreground"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M8.25 4.5l7.5 7.5-7.5 7.5"
									/>
								</svg>
							</Link>
						);
					})}

					<Button asChild variant="outline" className="w-full">
						<Link
							href={`/dashboard/series/${seriesId}/seasons/new`}
						>
							<Plus className="size-4" />
							Add Season
						</Link>
					</Button>
				</CardContent>
			</Card>

			{/* Trailer Upload */}
			<Card>
				<CardHeader>
					<CardTitle>Trailer</CardTitle>
					<CardDescription>
						Upload an optional promotional video for your series.
						Trailers are publicly viewable and can be shared freely.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TrailerUpload
						seriesId={seriesId}
						currentTrailerUrl={series.trailer_url}
					/>
				</CardContent>
			</Card>

			{/* Community */}
			<Card>
				<CardHeader>
					<CardTitle>Community</CardTitle>
					<CardDescription>
						Engage with your audience through discussions, announcements, and polls.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild variant="outline">
						<Link
							href={`/dashboard/series/${seriesId}/community`}
						>
							Manage Community
						</Link>
					</Button>
				</CardContent>
			</Card>

			{/* Danger Zone */}
			<Card>
				<CardHeader>
					<CardTitle className="text-destructive">
						Danger Zone
					</CardTitle>
					<CardDescription>
						Deleting a series will permanently remove all seasons,
						episodes, and associated content.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={async () => {
						"use server";
						await deleteAction();
					}}>
						<Button type="submit" variant="destructive">
							<Trash2 className="size-4" />
							Delete Series
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
