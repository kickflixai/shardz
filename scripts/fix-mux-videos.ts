import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// The 9 series that already have working Mux assets
const WORKING_SLUGS = new Set([
	"mock-the-hollow",
	"mock-the-watcher",
	"mock-dead-drop",
	"mock-awkward-exits",
	"mock-office-hours",
	"mock-the-last-letter",
	"mock-fractured-glass",
	"mock-neon-divide",
	"mock-signal-lost",
]);

async function fixMissingVideo() {
	// Get all series
	const { data: allSeries } = await db
		.from("series")
		.select("id, slug, title");
	if (!allSeries) {
		console.error("No series found");
		return;
	}

	const missingSeries = allSeries.filter(
		(s) => !WORKING_SLUGS.has(s.slug),
	);

	console.log("Series needing video fix:", missingSeries.length);
	console.log("Series already working:", WORKING_SLUGS.size);

	// Get one working playback ID to reuse
	const { data: sampleEp } = await db
		.from("episodes")
		.select("mux_playback_id, mux_asset_id")
		.not("mux_playback_id", "is", null)
		.limit(1)
		.single();

	if (!sampleEp) {
		console.error("No episodes with playback IDs found");
		return;
	}

	console.log("Reusing playback ID:", sampleEp.mux_playback_id);
	console.log("Reusing asset ID:", sampleEp.mux_asset_id);

	let totalUpdated = 0;

	for (const series of missingSeries) {
		// Get season IDs for this series
		const { data: seasons } = await db
			.from("seasons")
			.select("id")
			.eq("series_id", series.id);
		if (!seasons || seasons.length === 0) {
			console.log(`  ${series.slug}: no seasons found, skipping`);
			continue;
		}

		const seasonIds = seasons.map((s) => s.id);

		// Update all episodes in these seasons that are missing playback IDs
		const { error, count } = await db
			.from("episodes")
			.update({
				mux_playback_id: sampleEp.mux_playback_id,
				mux_asset_id: sampleEp.mux_asset_id,
			})
			.in("season_id", seasonIds)
			.is("mux_playback_id", null);

		if (error) {
			console.error(`  ${series.slug}: ERROR -`, error.message);
		} else {
			console.log(`  ${series.slug}: updated`);
			totalUpdated += count ?? 0;
		}
	}

	console.log(`\nTotal episodes updated: ${totalUpdated}`);

	// Verify
	const { data: remaining } = await db
		.from("episodes")
		.select("id")
		.is("mux_playback_id", null);

	console.log(
		"Episodes still without playback ID:",
		remaining ? remaining.length : 0,
	);
}

fixMissingVideo().catch((e) => console.error("Error:", e.message));
