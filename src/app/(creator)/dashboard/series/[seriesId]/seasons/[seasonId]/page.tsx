import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteSeason } from "@/modules/creator/actions/seasons";
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
import { SeasonForm } from "@/components/creator/season-form";
import { EpisodeListManager } from "@/components/creator/episode-list-manager";
import type { ContentStatus } from "@/db/types";

interface SeasonDetailPageProps {
	params: Promise<{ seriesId: string; seasonId: string }>;
}

const MIN_EPISODES_TO_PUBLISH = 8;
const MAX_EPISODES_TO_PUBLISH = 70;

/**
 * Season management page.
 *
 * Server component: auth + ownership chain check, fetch season with episodes.
 * Shows SeasonForm in edit mode, episode list manager, and upload link.
 */
export default async function SeasonDetailPage({
	params,
}: SeasonDetailPageProps) {
	const { seriesId, seasonId } = await params;

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(
			`/login?next=/dashboard/series/${seriesId}/seasons/${seasonId}`,
		);
	}

	// Verify series ownership
	const { data: series } = await supabase
		.from("series")
		.select("id, title, creator_id")
		.eq("id", seriesId)
		.single();

	if (!series || series.creator_id !== user.id) {
		redirect("/dashboard/series");
	}

	// Fetch season
	const { data: season } = await supabase
		.from("seasons")
		.select(
			`
			id, season_number, title, description, status, price_cents,
			price_tier_id, release_strategy, drip_interval_days
		`,
		)
		.eq("id", seasonId)
		.eq("series_id", seriesId)
		.single();

	if (!season) {
		redirect(`/dashboard/series/${seriesId}`);
	}

	// Fetch episodes ordered by sort_order
	const { data: episodes } = await supabase
		.from("episodes")
		.select(
			`
			id, episode_number, title, status, duration_seconds,
			thumbnail_url, sort_order, mux_playback_id
		`,
		)
		.eq("season_id", seasonId)
		.order("sort_order", { ascending: true });

	// Fetch price tiers for the form
	const { data: priceTiers } = await supabase
		.from("price_tiers")
		.select("id, label, price_cents, sort_order")
		.eq("is_active", true)
		.order("sort_order", { ascending: true });

	async function deleteAction() {
		"use server";
		await deleteSeason(seasonId, seriesId);
	}

	const episodeCount = episodes?.length ?? 0;
	const showPublishWarning =
		season.status === "draft" &&
		(episodeCount < MIN_EPISODES_TO_PUBLISH ||
			episodeCount > MAX_EPISODES_TO_PUBLISH);

	return (
		<div className="mx-auto max-w-3xl py-8 space-y-8">
			{/* Season Edit */}
			<Card>
				<CardHeader>
					<CardTitle>
						{season.title || `Season ${season.season_number}`}
					</CardTitle>
					<CardDescription>
						{series.title} - Edit season details
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SeasonForm
						mode="edit"
						seriesId={seriesId}
						priceTiers={
							priceTiers?.map((t) => ({
								id: t.id,
								label: t.label,
								priceCents: t.price_cents,
							})) ?? []
						}
						initialData={{
							id: season.id,
							title: season.title,
							description: season.description,
							priceTierId: season.price_tier_id,
							releaseStrategy: season.release_strategy,
							dripIntervalDays: season.drip_interval_days,
						}}
					/>
				</CardContent>
			</Card>

			{/* Episode List */}
			<Card>
				<CardHeader>
					<CardTitle>Episodes</CardTitle>
					<CardDescription>
						{episodeCount > 0
							? `${episodeCount} episode${episodeCount !== 1 ? "s" : ""}`
							: "No episodes yet. Upload your first episode to get started."}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Publish warning (Pitfall 8) */}
					{showPublishWarning && episodeCount > 0 && (
						<div className="rounded-md bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
							{episodeCount < MIN_EPISODES_TO_PUBLISH
								? `You need at least ${MIN_EPISODES_TO_PUBLISH} published episodes to publish this season (currently ${episodeCount}).`
								: `Seasons can have at most ${MAX_EPISODES_TO_PUBLISH} episodes (currently ${episodeCount}).`}
						</div>
					)}

					{episodes && episodes.length > 0 && (
						<EpisodeListManager
							seasonId={seasonId}
							seriesId={seriesId}
							episodes={episodes.map((ep) => ({
								id: ep.id,
								episodeNumber: ep.episode_number,
								title: ep.title,
								status: ep.status as ContentStatus,
								durationSeconds: ep.duration_seconds,
								thumbnailUrl: ep.thumbnail_url,
								sortOrder: ep.sort_order,
							}))}
						/>
					)}

					<Button asChild variant="outline" className="w-full">
						<Link
							href={`/dashboard/series/${seriesId}/seasons/${seasonId}/episodes/new`}
						>
							<Plus className="size-4" />
							Upload New Episode
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
						Deleting this season will permanently remove all its
						episodes and associated content.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={deleteAction}>
						<Button type="submit" variant="destructive">
							<Trash2 className="size-4" />
							Delete Season
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
