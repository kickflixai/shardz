import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { EpisodeUploadForm } from "@/components/creator/episode-upload-form";

interface EpisodeNewPageProps {
	params: Promise<{ seriesId: string; seasonId: string }>;
}

/**
 * New episode upload page.
 *
 * Server component that:
 * 1. Authenticates the user and verifies creator role
 * 2. Verifies the creator owns the series
 * 3. Fetches the season and computes the next episode number
 * 4. Renders the EpisodeUploadForm
 */
export default async function EpisodeNewPage({ params }: EpisodeNewPageProps) {
	const { seriesId, seasonId } = await params;

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(
			`/login?next=/dashboard/series/${seriesId}/seasons/${seasonId}/episodes/new`,
		);
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

	// Verify the creator owns this series
	const { data: series } = await supabase
		.from("series")
		.select("id, title, creator_id")
		.eq("id", seriesId)
		.single();

	if (!series || series.creator_id !== user.id) {
		redirect("/dashboard");
	}

	// Fetch season and compute next episode number
	const { data: season } = await supabase
		.from("seasons")
		.select("id, season_number, title")
		.eq("id", seasonId)
		.eq("series_id", seriesId)
		.single();

	if (!season) {
		redirect(`/dashboard/series/${seriesId}`);
	}

	// Count existing episodes to determine next episode number
	const { count } = await supabase
		.from("episodes")
		.select("id", { count: "exact", head: true })
		.eq("season_id", seasonId);

	const nextEpisodeNumber = (count ?? 0) + 1;

	return (
		<div className="mx-auto max-w-2xl py-8">
			<Card>
				<CardHeader>
					<CardTitle>Upload Episode</CardTitle>
					<CardDescription>
						{series.title}
						{season.title
							? ` - ${season.title}`
							: ` - Season ${season.season_number}`}
						{" | "}Episode {nextEpisodeNumber}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<EpisodeUploadForm
						seasonId={seasonId}
						seriesId={seriesId}
						nextEpisodeNumber={nextEpisodeNumber}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
