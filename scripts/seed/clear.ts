/**
 * Shardz Clear Script
 *
 * Removes all mock data from the platform: Mux assets, Supabase Storage files,
 * database records, and auth users. Enables the "clear and replace with real content"
 * requirement (PTCH-03).
 *
 * Usage: pnpm seed:clear (runs via tsx --env-file=.env.local)
 *
 * Cleanup ordering (reverse of creation to respect FK constraints):
 *   1. Identify all mock content
 *   2. Clean up Mux assets
 *   3. Clean up Supabase Storage
 *   4. Delete database records (series CASCADE handles seasons/episodes)
 *   5. Delete mock auth users (CASCADE handles profile rows)
 *   6. Summary
 *
 * Idempotent: running on an already-clean database completes without errors.
 */

import { adminDb } from "./lib/supabase";
import { mux } from "./lib/mux";

// ---------------------------------------------------------------------------
// Step 1: Identify all mock content
// ---------------------------------------------------------------------------

interface MockContent {
	seriesIds: string[];
	seriesSlugs: string[];
	episodeMuxAssetIds: string[];
	profileIds: string[];
	profileUsernames: string[];
}

async function identifyMockContent(): Promise<MockContent> {
	console.log("\n=== Step 1: Identifying mock content ===\n");

	// Find all mock series (slug starts with 'mock-')
	const { data: mockSeries, error: seriesError } = await adminDb
		.from("series")
		.select("id, slug")
		.like("slug", "mock-%");

	if (seriesError) {
		console.error("  Failed to query mock series:", seriesError.message);
	}

	const seriesIds = (mockSeries ?? []).map((s: { id: string }) => s.id);
	const seriesSlugs = (mockSeries ?? []).map(
		(s: { slug: string }) => s.slug,
	);
	console.log(`  Found ${seriesIds.length} mock series`);

	// Find episodes with Mux assets belonging to mock series
	let episodeMuxAssetIds: string[] = [];
	if (seriesIds.length > 0) {
		const { data: mockSeasons } = await adminDb
			.from("seasons")
			.select("id")
			.in("series_id", seriesIds);

		const seasonIds = (mockSeasons ?? []).map(
			(s: { id: string }) => s.id,
		);

		if (seasonIds.length > 0) {
			const { data: mockEpisodes } = await adminDb
				.from("episodes")
				.select("mux_asset_id")
				.in("season_id", seasonIds)
				.not("mux_asset_id", "is", null);

			episodeMuxAssetIds = (mockEpisodes ?? [])
				.map((e: { mux_asset_id: string | null }) => e.mux_asset_id)
				.filter((id): id is string => id !== null);
		}
	}
	console.log(`  Found ${episodeMuxAssetIds.length} Mux assets to clean up`);

	// Find all mock profiles (username starts with 'mock_')
	const { data: mockProfiles, error: profileError } = await adminDb
		.from("profiles")
		.select("id, username")
		.like("username", "mock_%");

	if (profileError) {
		console.error("  Failed to query mock profiles:", profileError.message);
	}

	const profileIds = (mockProfiles ?? []).map(
		(p: { id: string }) => p.id,
	);
	const profileUsernames = (mockProfiles ?? []).map(
		(p: { username: string }) => p.username,
	);
	console.log(`  Found ${profileIds.length} mock profiles`);

	return {
		seriesIds,
		seriesSlugs,
		episodeMuxAssetIds,
		profileIds,
		profileUsernames,
	};
}

// ---------------------------------------------------------------------------
// Step 2: Clean up Mux assets
// ---------------------------------------------------------------------------

async function cleanupMuxAssets(assetIds: string[]): Promise<number> {
	console.log("\n=== Step 2: Cleaning up Mux assets ===\n");

	if (assetIds.length === 0) {
		console.log("  No Mux assets to clean up");
		return 0;
	}

	let deleted = 0;
	let skipped = 0;

	for (const assetId of assetIds) {
		try {
			await mux.video.assets.delete(assetId);
			deleted++;
		} catch (err: unknown) {
			// Asset may already be deleted
			const message =
				err instanceof Error ? err.message : String(err);
			if (
				message.includes("not found") ||
				message.includes("404")
			) {
				skipped++;
			} else {
				console.warn(
					`  [WARN] Failed to delete Mux asset ${assetId}:`,
					message,
				);
				skipped++;
			}
		}
	}

	console.log(
		`  Mux assets: ${deleted} deleted, ${skipped} skipped (already gone)\n`,
	);
	return deleted;
}

// ---------------------------------------------------------------------------
// Step 3: Clean up Supabase Storage
// ---------------------------------------------------------------------------

async function cleanupStorage(profileIds: string[]): Promise<number> {
	console.log("\n=== Step 3: Cleaning up Supabase Storage ===\n");

	if (profileIds.length === 0) {
		console.log("  No storage files to clean up");
		return 0;
	}

	let totalRemoved = 0;

	for (const profileId of profileIds) {
		try {
			// List files in the creator's storage path
			const { data: files, error: listError } = await adminDb.storage
				.from("thumbnails")
				.list(profileId);

			if (listError) {
				console.warn(
					`  [WARN] Failed to list storage for ${profileId}:`,
					listError.message,
				);
				continue;
			}

			if (!files || files.length === 0) continue;

			const filePaths = files.map(
				(f: { name: string }) => `${profileId}/${f.name}`,
			);

			const { error: removeError } = await adminDb.storage
				.from("thumbnails")
				.remove(filePaths);

			if (removeError) {
				console.warn(
					`  [WARN] Failed to remove storage files for ${profileId}:`,
					removeError.message,
				);
			} else {
				totalRemoved += filePaths.length;
			}
		} catch (err) {
			console.warn(
				`  [WARN] Storage cleanup error for ${profileId}:`,
				err,
			);
		}
	}

	console.log(`  Removed ${totalRemoved} storage files\n`);
	return totalRemoved;
}

// ---------------------------------------------------------------------------
// Step 4: Delete database records
// ---------------------------------------------------------------------------

async function cleanupDatabase(
	seriesIds: string[],
	profileIds: string[],
): Promise<{ series: number; followers: number; editorialPicks: number }> {
	console.log("\n=== Step 4: Deleting database records ===\n");

	let seriesDeleted = 0;
	let followersDeleted = 0;
	let editorialPicksDeleted = 0;

	// Delete editorial picks for mock series
	if (seriesIds.length > 0) {
		const { data: epData, error: epError } = await adminDb
			.from("editorial_picks")
			.delete()
			.in("series_id", seriesIds)
			.select("id");

		if (epError) {
			console.warn(
				"  [WARN] Failed to delete editorial picks:",
				epError.message,
			);
		} else {
			editorialPicksDeleted = epData?.length ?? 0;
		}

		// Delete community posts for mock series
		await adminDb
			.from("community_posts")
			.delete()
			.in("series_id", seriesIds);
	}

	// Delete follower rows referencing mock creators
	if (profileIds.length > 0) {
		const { data: followerData, error: followerError } = await adminDb
			.from("followers")
			.delete()
			.in("creator_id", profileIds)
			.select("id");

		if (followerError) {
			console.warn(
				"  [WARN] Failed to delete follower rows:",
				followerError.message,
			);
		} else {
			followersDeleted = followerData?.length ?? 0;
		}

		// Also delete followers where mock users are following others
		await adminDb
			.from("followers")
			.delete()
			.in("follower_id", profileIds);
	}

	// Delete mock series -- CASCADE handles seasons and episodes
	if (seriesIds.length > 0) {
		const { data: deletedSeries, error: seriesError } = await adminDb
			.from("series")
			.delete()
			.in("id", seriesIds)
			.select("id");

		if (seriesError) {
			console.error(
				"  Failed to delete mock series:",
				seriesError.message,
			);
		} else {
			seriesDeleted = deletedSeries?.length ?? 0;
		}
	}

	console.log(`  Series deleted: ${seriesDeleted} (with cascaded seasons/episodes)`);
	console.log(`  Follower rows deleted: ${followersDeleted}`);
	console.log(`  Editorial picks deleted: ${editorialPicksDeleted}\n`);

	return {
		series: seriesDeleted,
		followers: followersDeleted,
		editorialPicks: editorialPicksDeleted,
	};
}

// ---------------------------------------------------------------------------
// Step 5: Delete mock auth users
// ---------------------------------------------------------------------------

async function cleanupAuthUsers(profileIds: string[]): Promise<number> {
	console.log("\n=== Step 5: Deleting mock auth users ===\n");

	if (profileIds.length === 0) {
		console.log("  No mock auth users to delete");
		return 0;
	}

	let deleted = 0;
	let skipped = 0;

	for (const profileId of profileIds) {
		try {
			const { error } = await adminDb.auth.admin.deleteUser(profileId);
			if (error) {
				if (
					error.message.includes("not found") ||
					error.message.includes("User not found")
				) {
					skipped++;
				} else {
					console.warn(
						`  [WARN] Failed to delete user ${profileId}:`,
						error.message,
					);
					skipped++;
				}
			} else {
				deleted++;
			}
		} catch (err) {
			console.warn(`  [WARN] Error deleting user ${profileId}:`, err);
			skipped++;
		}
	}

	console.log(
		`  Auth users: ${deleted} deleted, ${skipped} skipped (already gone)\n`,
	);
	return deleted;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	console.log("============================================");
	console.log("  Shardz Clear Script");
	console.log("============================================");
	console.log(`  Start: ${new Date().toISOString()}`);
	console.log("============================================\n");

	const startTime = Date.now();

	try {
		// Step 1: Identify
		const content = await identifyMockContent();

		// Step 2: Mux cleanup
		const muxDeleted = await cleanupMuxAssets(content.episodeMuxAssetIds);

		// Step 3: Storage cleanup
		const storageRemoved = await cleanupStorage(content.profileIds);

		// Step 4: Database cleanup
		const dbStats = await cleanupDatabase(
			content.seriesIds,
			content.profileIds,
		);

		// Step 5: Auth user cleanup
		const usersDeleted = await cleanupAuthUsers(content.profileIds);

		// Summary
		const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
		console.log("============================================");
		console.log("  Clear complete!");
		console.log(`  Duration: ${elapsed}s`);
		console.log(`  Mux assets deleted: ${muxDeleted}`);
		console.log(`  Storage files removed: ${storageRemoved}`);
		console.log(`  Series deleted: ${dbStats.series}`);
		console.log(`  Follower rows deleted: ${dbStats.followers}`);
		console.log(`  Editorial picks deleted: ${dbStats.editorialPicks}`);
		console.log(`  Auth users deleted: ${usersDeleted}`);
		console.log("============================================");
	} catch (err) {
		console.error("\nClear failed:", err);
		process.exit(1);
	}
}

main();
