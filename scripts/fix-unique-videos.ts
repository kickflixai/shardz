/**
 * Fix Mux Videos: Upload unique video for each series
 *
 * Problem: Many series share the same Mux playback ID because the initial
 * seed failed for some uploads and a fix script reused one working asset.
 *
 * Solution: For each series, upload its unique .mp4 from assets/videos/
 * and update all episodes with the new playback ID.
 *
 * Usage: pnpm tsx --env-file=.env.local scripts/fix-unique-videos.ts
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { adminDb } from "./seed/lib/supabase";
import { mux } from "./seed/lib/mux";

const VIDEO_DIR = resolve(import.meta.dirname ?? __dirname, "seed/assets/videos");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function uploadLocalVideoToMux(
	filePath: string,
	passthrough?: string,
): Promise<string | null> {
	try {
		const upload = await mux.video.uploads.create({
			new_asset_settings: {
				playback_policies: ["signed"],
				passthrough,
				video_quality: "basic",
			},
			cors_origin: "*",
		});

		const uploadUrl = upload.url;
		if (!uploadUrl) {
			console.error("    No upload URL returned from Mux");
			return null;
		}

		const fileBuffer = readFileSync(filePath);
		const response = await fetch(uploadUrl, {
			method: "PUT",
			headers: { "Content-Type": "video/mp4" },
			body: fileBuffer,
		});

		if (!response.ok) {
			console.error(`    Upload PUT failed: ${response.status} ${response.statusText}`);
			return null;
		}

		// Poll the upload to get the asset ID
		const start = Date.now();
		const timeoutMs = 60000;
		while (Date.now() - start < timeoutMs) {
			const status = await mux.video.uploads.retrieve(upload.id);
			if (status.asset_id) {
				return status.asset_id;
			}
			if (status.status === "errored") {
				console.error("    Upload errored:", status.error);
				return null;
			}
			await new Promise((r) => setTimeout(r, 3000));
		}

		console.warn("    Upload timed out waiting for asset_id");
		return null;
	} catch (err) {
		console.error("    Failed to upload local video:", err);
		return null;
	}
}

async function pollMuxAsset(
	assetId: string,
	timeoutMs = 180000,
	intervalMs = 5000,
): Promise<{ playbackId: string | null; duration: number | null }> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		const asset = await mux.video.assets.retrieve(assetId);
		if (asset.status === "ready") {
			return {
				playbackId: asset.playback_ids?.[0]?.id ?? null,
				duration: asset.duration ?? null,
			};
		}
		if (asset.status === "errored") {
			console.error(`  Mux asset ${assetId} errored:`, asset.errors);
			return { playbackId: null, duration: null };
		}
		await new Promise((r) => setTimeout(r, intervalMs));
	}
	console.warn(`  Mux asset ${assetId} timed out after ${timeoutMs}ms`);
	return { playbackId: null, duration: null };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	console.log("=== Fix Unique Videos: Upload unique Mux asset per series ===\n");

	// 1. Get all series with their current Mux playback IDs
	const { data: allSeries, error: seriesError } = await adminDb
		.from("series")
		.select("id, slug, title")
		.eq("status", "published")
		.order("slug");

	if (seriesError || !allSeries) {
		console.error("Failed to fetch series:", seriesError?.message);
		process.exit(1);
	}

	// 2. For each series, get the current playback ID from its episodes
	const seriesPlaybacks: {
		seriesId: string;
		slug: string;
		title: string;
		currentPlaybackId: string | null;
		episodeIds: string[];
	}[] = [];

	for (const s of allSeries) {
		const { data: episodes } = await adminDb
			.from("episodes")
			.select("id, mux_playback_id, seasons!inner(series_id)")
			.eq("seasons.series_id", s.id);

		const episodeIds = (episodes ?? []).map((e: { id: string }) => e.id);
		const currentPlaybackId = (episodes?.[0] as { mux_playback_id?: string | null })?.mux_playback_id ?? null;

		seriesPlaybacks.push({
			seriesId: s.id,
			slug: s.slug,
			title: s.title,
			currentPlaybackId,
			episodeIds,
		});
	}

	// 3. Find duplicate playback IDs
	const playbackIdCount = new Map<string, number>();
	for (const sp of seriesPlaybacks) {
		if (sp.currentPlaybackId) {
			playbackIdCount.set(
				sp.currentPlaybackId,
				(playbackIdCount.get(sp.currentPlaybackId) ?? 0) + 1,
			);
		}
	}

	const duplicatePlaybackIds = new Set<string>();
	for (const [pid, count] of playbackIdCount.entries()) {
		if (count > 1) {
			duplicatePlaybackIds.add(pid);
		}
	}

	console.log(`Total series: ${seriesPlaybacks.length}`);
	console.log(`Unique playback IDs: ${playbackIdCount.size}`);
	console.log(`Duplicate playback IDs (shared by 2+ series): ${duplicatePlaybackIds.size}`);

	// 4. Identify which series need new uploads
	const needsUpload = seriesPlaybacks.filter(
		(sp) => !sp.currentPlaybackId || duplicatePlaybackIds.has(sp.currentPlaybackId),
	);

	// Series that already have unique playback IDs - skip them
	const alreadyUnique = seriesPlaybacks.filter(
		(sp) => sp.currentPlaybackId && !duplicatePlaybackIds.has(sp.currentPlaybackId),
	);

	console.log(`\nAlready unique (skipping): ${alreadyUnique.length}`);
	for (const sp of alreadyUnique) {
		console.log(`  OK  ${sp.slug} → ${sp.currentPlaybackId}`);
	}

	console.log(`\nNeed upload: ${needsUpload.length}`);
	for (const sp of needsUpload) {
		const localVideoPath = resolve(VIDEO_DIR, `${sp.slug}.mp4`);
		const hasLocal = existsSync(localVideoPath);
		console.log(`  ${hasLocal ? "HAS" : "MISSING"} ${sp.slug} (${sp.episodeIds.length} episodes)`);
	}

	if (needsUpload.length === 0) {
		console.log("\nAll series already have unique videos!");
		return;
	}

	// 5. Upload videos and update episodes
	console.log(`\n=== Uploading ${needsUpload.length} videos to Mux ===\n`);

	let successCount = 0;
	let failCount = 0;

	for (const sp of needsUpload) {
		const localVideoPath = resolve(VIDEO_DIR, `${sp.slug}.mp4`);

		if (!existsSync(localVideoPath)) {
			console.log(`  SKIP ${sp.slug} — no local .mp4 file`);
			failCount++;
			continue;
		}

		const fileSize = statSync(localVideoPath).size;
		console.log(`  UPLOAD ${sp.slug} (${(fileSize / 1024 / 1024).toFixed(1)} MB)...`);

		// Upload to Mux
		const assetId = await uploadLocalVideoToMux(localVideoPath, sp.slug);
		if (!assetId) {
			console.error(`    FAILED to upload ${sp.slug}`);
			failCount++;
			continue;
		}

		console.log(`    Asset created: ${assetId}, polling for ready...`);

		// Poll until ready
		const result = await pollMuxAsset(assetId);
		if (!result.playbackId) {
			console.error(`    FAILED — asset not ready for ${sp.slug}`);
			failCount++;
			continue;
		}

		console.log(`    Ready! Playback ID: ${result.playbackId}`);

		// Update all episodes for this series (don't set duration — mock videos are <60s, constraint requires 60-180s)
		for (const episodeId of sp.episodeIds) {
			const { error: updateError } = await adminDb
				.from("episodes")
				.update({
					mux_asset_id: assetId,
					mux_playback_id: result.playbackId,
				})
				.eq("id", episodeId);

			if (updateError) {
				console.error(`    Failed to update episode ${episodeId}:`, updateError.message);
			}
		}

		console.log(`    Updated ${sp.episodeIds.length} episodes`);
		successCount++;
	}

	console.log(`\n=== Done ===`);
	console.log(`  Success: ${successCount}`);
	console.log(`  Failed: ${failCount}`);
	console.log(`  Already unique: ${alreadyUnique.length}`);
	console.log(`  Total: ${seriesPlaybacks.length}`);
}

main().catch(console.error);
