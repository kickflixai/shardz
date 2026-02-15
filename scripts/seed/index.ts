/**
 * Shardz Seed Script
 *
 * Populates the platform with mock data: auth users, profiles, series/seasons/episodes,
 * thumbnails, Mux video assets, engagement metrics, and featured flags.
 *
 * Usage: pnpm seed (runs via tsx --env-file=.env.local)
 *
 * Ordering is CRITICAL due to FK constraints and DB triggers:
 *   1. Auth users + profiles (profiles FK -> auth.users)
 *   2. Thumbnails upload (needs creator IDs for storage paths)
 *   3. Series -> seasons -> episodes (series FK -> profiles; seasons FK -> series; episodes FK -> seasons)
 *      Episodes published BEFORE seasons (check_season_episode_count trigger requires 8+ published episodes)
 *   4. Mux video ingestion (needs episode IDs)
 *   5. Engagement metrics (needs series/profile IDs)
 *   6. Featured flags (needs series IDs)
 *
 * Idempotent: uses upsert with onConflict for re-runs without duplicates.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { adminDb } from "./lib/supabase";
import { mux } from "./lib/mux";
import { uploadThumbnail } from "./lib/storage";
import { MOCK_CREATORS } from "./data/creators";
import { MOCK_SERIES } from "./data/series";
import { generateEngagement } from "./data/engagement";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreatorMapping {
	creatorIndex: number;
	userId: string;
}

interface SeriesMapping {
	seriesIndex: number;
	seriesId: string;
	slug: string;
	isHeroSeries: boolean;
	seasons: Array<{
		seasonId: string;
		seasonNumber: number;
		episodes: Array<{
			episodeId: string;
			episodeNumber: number;
		}>;
	}>;
}

// ---------------------------------------------------------------------------
// Video assets directory
// ---------------------------------------------------------------------------
// Place one video file per series in scripts/seed/assets/videos/ named {slug}.mp4
// e.g. scripts/seed/assets/videos/mock-signal-lost.mp4
//
// Each clip is reused for ALL episodes in that series.
// If no local file is found, falls back to FALLBACK_VIDEO_URL.
// ---------------------------------------------------------------------------

const VIDEO_DIR = resolve(
	import.meta.dirname ?? __dirname,
	"assets/videos",
);

const FALLBACK_VIDEO_URL =
	"https://cdn.pixabay.com/video/2020/08/08/46944-449623750_large.mp4";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Poll a Mux asset until it reaches "ready" status.
 * Returns the ready asset data with playback_ids.
 */
async function pollMuxAsset(
	assetId: string,
	timeoutMs = 120000,
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

/**
 * Upload a local video file to Mux via direct upload.
 * 1. Creates a Mux direct upload (returns an upload URL + asset settings)
 * 2. PUTs the file bytes to that upload URL
 * 3. Returns the Mux asset ID created from the upload
 */
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

		// Read file and PUT to the upload URL
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

// ---------------------------------------------------------------------------
// Step 1: Create auth users + profiles
// ---------------------------------------------------------------------------

async function seedCreators(): Promise<CreatorMapping[]> {
	console.log("\n=== Step 1: Creating auth users and profiles ===\n");
	const mappings: CreatorMapping[] = [];

	for (let i = 0; i < MOCK_CREATORS.length; i++) {
		const creator = MOCK_CREATORS[i];
		let userId: string | null = null;

		// Create auth user (or find existing)
		const { data: authData, error: authError } =
			await adminDb.auth.admin.createUser({
				email: creator.email,
				password: creator.password,
				email_confirm: true,
				user_metadata: {
					display_name: creator.displayName,
					username: creator.username,
				},
			});

		if (authError) {
			if (
				authError.message.includes("already been registered") ||
				authError.message.includes("already exists")
			) {
				// Look up existing user by email
				const { data: listData } =
					await adminDb.auth.admin.listUsers();
				const existingUser = listData?.users?.find(
					(u) => u.email === creator.email,
				);
				if (existingUser) {
					userId = existingUser.id;
					console.log(
						`  [${i + 1}/${MOCK_CREATORS.length}] Found existing user: ${creator.displayName} (${userId})`,
					);
				} else {
					console.error(
						`  [${i + 1}/${MOCK_CREATORS.length}] User exists but couldn't find: ${creator.email}`,
					);
					continue;
				}
			} else {
				console.error(
					`  [${i + 1}/${MOCK_CREATORS.length}] Failed to create user ${creator.email}:`,
					authError.message,
				);
				continue;
			}
		} else {
			userId = authData.user.id;
			console.log(
				`  [${i + 1}/${MOCK_CREATORS.length}] Created user: ${creator.displayName} (${userId})`,
			);
		}

		// Upsert profile row
		const { error: profileError } = await adminDb
			.from("profiles")
			.upsert(
				{
					id: userId,
					username: creator.username,
					display_name: creator.displayName,
					bio: creator.bio,
					avatar_url: creator.avatarUrl,
					role: "creator",
					social_links: creator.socialLinks,
				},
				{ onConflict: "id" },
			);

		if (profileError) {
			console.error(
				`  Failed to upsert profile for ${creator.displayName}:`,
				profileError.message,
			);
			continue;
		}

		mappings.push({ creatorIndex: i, userId });
	}

	console.log(`\n  Created ${mappings.length} creators\n`);
	return mappings;
}

// ---------------------------------------------------------------------------
// Step 2: Upload thumbnails from local files
// ---------------------------------------------------------------------------

async function seedThumbnails(
	creatorMappings: CreatorMapping[],
): Promise<Map<string, string>> {
	console.log("\n=== Step 2: Uploading thumbnails ===\n");
	const thumbnailUrls = new Map<string, string>();
	const thumbnailDir = resolve(
		import.meta.dirname ?? __dirname,
		"assets/thumbnails",
	);

	for (const series of MOCK_SERIES) {
		const localPath = resolve(thumbnailDir, `${series.slug}.png`);
		if (!existsSync(localPath)) {
			console.log(
				`  [SKIP] No thumbnail for ${series.slug} (${localPath})`,
			);
			continue;
		}

		const creator = creatorMappings.find(
			(m) => m.creatorIndex === series.creatorIndex,
		);
		if (!creator) {
			console.warn(
				`  [SKIP] No creator mapping for ${series.slug} (creatorIndex: ${series.creatorIndex})`,
			);
			continue;
		}

		const storagePath = `${creator.userId}/${series.slug}-thumbnail.png`;
		try {
			const publicUrl = await uploadThumbnail(
				adminDb,
				localPath,
				storagePath,
			);
			thumbnailUrls.set(series.slug, publicUrl);
			console.log(`  Uploaded thumbnail: ${series.slug}`);
		} catch (err) {
			console.warn(
				`  [WARN] Failed to upload thumbnail for ${series.slug}:`,
				err,
			);
		}
	}

	console.log(
		`\n  Uploaded ${thumbnailUrls.size} thumbnails (${MOCK_SERIES.length - thumbnailUrls.size} skipped)\n`,
	);
	return thumbnailUrls;
}

// ---------------------------------------------------------------------------
// Step 3: Create series -> seasons -> episodes hierarchy
// ---------------------------------------------------------------------------

async function seedContent(
	creatorMappings: CreatorMapping[],
	thumbnailUrls: Map<string, string>,
): Promise<SeriesMapping[]> {
	console.log("\n=== Step 3: Creating series/seasons/episodes ===\n");
	const seriesMappings: SeriesMapping[] = [];

	for (let si = 0; si < MOCK_SERIES.length; si++) {
		const series = MOCK_SERIES[si];
		const creator = creatorMappings.find(
			(m) => m.creatorIndex === series.creatorIndex,
		);
		if (!creator) {
			console.warn(
				`  [SKIP] No creator for series ${series.slug} (index ${series.creatorIndex})`,
			);
			continue;
		}

		// Upsert series
		const { data: seriesData, error: seriesError } = await adminDb
			.from("series")
			.upsert(
				{
					slug: series.slug,
					title: series.title,
					description: series.description,
					genre: series.genre,
					creator_id: creator.userId,
					thumbnail_url: thumbnailUrls.get(series.slug) ?? null,
					status: "published",
					is_featured: false,
				},
				{ onConflict: "slug" },
			)
			.select("id")
			.single();

		if (seriesError || !seriesData) {
			console.error(
				`  Failed to upsert series ${series.slug}:`,
				seriesError?.message,
			);
			continue;
		}

		const seriesId = seriesData.id;
		const seasonMappings: SeriesMapping["seasons"] = [];

		for (const season of series.seasons) {
			// Upsert season (initially draft)
			const { data: seasonData, error: seasonError } = await adminDb
				.from("seasons")
				.upsert(
					{
						series_id: seriesId,
						season_number: season.seasonNumber,
						title: season.title,
						description: season.description,
						price_cents: season.priceCents,
						status: "draft",
					},
					{ onConflict: "series_id,season_number" },
				)
				.select("id")
				.single();

			if (seasonError || !seasonData) {
				console.error(
					`  Failed to upsert season ${season.seasonNumber} of ${series.slug}:`,
					seasonError?.message,
				);
				continue;
			}

			const seasonId = seasonData.id;
			const episodeMappings: SeriesMapping["seasons"][number]["episodes"] =
				[];

			// Insert episodes
			for (let ei = 0; ei < season.episodes.length; ei++) {
				const episode = season.episodes[ei];
				const episodeNumber = ei + 1;

				const { data: epData, error: epError } = await adminDb
					.from("episodes")
					.upsert(
						{
							season_id: seasonId,
							episode_number: episodeNumber,
							title: episode.title,
							description: episode.description,
							status: "draft",
							sort_order: episodeNumber,
						},
						{ onConflict: "season_id,episode_number" },
					)
					.select("id")
					.single();

				if (epError || !epData) {
					console.error(
						`  Failed to upsert episode ${episodeNumber} of S${season.seasonNumber} ${series.slug}:`,
						epError?.message,
					);
					continue;
				}

				episodeMappings.push({
					episodeId: epData.id,
					episodeNumber,
				});
			}

			// Batch-update all episodes in this season to "published"
			const { error: epPublishError } = await adminDb
				.from("episodes")
				.update({ status: "published" })
				.eq("season_id", seasonId);

			if (epPublishError) {
				console.error(
					`  Failed to publish episodes for S${season.seasonNumber} of ${series.slug}:`,
					epPublishError.message,
				);
			}

			// Now publish the season (AFTER episodes are published -- trigger requires 8+ published episodes)
			const { error: seasonPublishError } = await adminDb
				.from("seasons")
				.update({ status: "published" })
				.eq("id", seasonId);

			if (seasonPublishError) {
				console.error(
					`  Failed to publish season ${season.seasonNumber} of ${series.slug}:`,
					seasonPublishError.message,
				);
			}

			seasonMappings.push({
				seasonId,
				seasonNumber: season.seasonNumber,
				episodes: episodeMappings,
			});
		}

		seriesMappings.push({
			seriesIndex: si,
			seriesId,
			slug: series.slug,
			isHeroSeries: series.isHeroSeries,
			seasons: seasonMappings,
		});

		console.log(
			`  [${si + 1}/${MOCK_SERIES.length}] ${series.title}: ${seasonMappings.length} seasons, ${seasonMappings.reduce((a, s) => a + s.episodes.length, 0)} episodes`,
		);
	}

	console.log(`\n  Created ${seriesMappings.length} series\n`);
	return seriesMappings;
}

// ---------------------------------------------------------------------------
// Step 4: Ingest video into Mux
// ---------------------------------------------------------------------------

async function seedVideo(seriesMappings: SeriesMapping[]): Promise<void> {
	console.log("\n=== Step 4: Ingesting video into Mux ===\n");

	// Track all Mux asset creations for parallel polling
	const assetUpdates: Array<{
		assetId: string;
		episodeId: string;
	}> = [];

	// Upload one Mux asset per series, then reuse its playback ID for all episodes.
	// This avoids creating duplicate Mux assets for the same clip.
	const seriesAssetCache = new Map<string, { assetId: string; playbackId: string | null }>();

	for (const sm of seriesMappings) {
		const localVideoPath = resolve(VIDEO_DIR, `${sm.slug}.mp4`);
		const hasLocalFile = existsSync(localVideoPath);

		console.log(
			`  [${hasLocalFile ? "LOCAL" : "FALLBACK"}] ${sm.slug}...`,
		);

		let assetId: string | null = null;

		if (hasLocalFile) {
			// Upload the local file to Mux once per series
			const fileSize = statSync(localVideoPath).size;
			console.log(`    Uploading ${(fileSize / 1024 / 1024).toFixed(1)} MB...`);
			assetId = await uploadLocalVideoToMux(localVideoPath, sm.slug);
			if (assetId) {
				console.log(`    Mux asset created: ${assetId}`);
			} else {
				console.warn(`    Local upload failed, falling back to URL...`);
			}
		}

		if (!assetId) {
			// Fallback: create asset from URL
			try {
				const asset = await mux.video.assets.create({
					input: [{ url: FALLBACK_VIDEO_URL }],
					playback_policies: ["signed"],
					passthrough: sm.slug,
					video_quality: "basic",
				});
				assetId = asset.id;
			} catch (err) {
				console.error(`    Failed to create fallback Mux asset for ${sm.slug}:`, err);
				continue;
			}
		}

		// Poll for ready and get playback ID
		const result = await pollMuxAsset(assetId);
		seriesAssetCache.set(sm.slug, {
			assetId,
			playbackId: result.playbackId,
		});

		if (result.playbackId) {
			console.log(`    Ready: playback ID ${result.playbackId}`);
		} else {
			console.warn(`    Asset ${assetId} not ready, episodes will lack playback`);
		}

		// Assign the same Mux asset to ALL episodes in this series
		for (const season of sm.seasons) {
			for (const ep of season.episodes) {
				assetUpdates.push({
					assetId,
					episodeId: ep.episodeId,
				});
			}
		}
		console.log(
			`    Assigned to ${sm.seasons.reduce((a, s) => a + s.episodes.length, 0)} episodes`,
		);
	}

	// Write Mux asset/playback IDs to episode rows (already polled per-series above)
	console.log(
		`\n  Writing Mux asset IDs to ${assetUpdates.length} episodes...`,
	);

	const BATCH_SIZE = 20;
	let readyCount = 0;
	let failedCount = 0;

	for (let i = 0; i < assetUpdates.length; i += BATCH_SIZE) {
		const batch = assetUpdates.slice(i, i + BATCH_SIZE);

		const results = await Promise.all(
			batch.map(async ({ assetId, episodeId }) => {
				// Look up the cached playback ID for this asset
				let playbackId: string | null = null;
				for (const cached of seriesAssetCache.values()) {
					if (cached.assetId === assetId) {
						playbackId = cached.playbackId;
						break;
					}
				}

				if (playbackId) {
					const { error } = await adminDb
						.from("episodes")
						.update({
							mux_asset_id: assetId,
							mux_playback_id: playbackId,
							duration_seconds: null,
						})
						.eq("id", episodeId);

					if (error) {
						console.error(
							`    Failed to update episode ${episodeId}:`,
							error.message,
						);
						return false;
					}
					return true;
				}
				return false;
			}),
		);

		readyCount += results.filter(Boolean).length;
		failedCount += results.filter((r) => !r).length;

		console.log(
			`    Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${results.filter(Boolean).length}/${batch.length} updated`,
		);
	}

	console.log(
		`\n  Video ingestion complete: ${readyCount} ready, ${failedCount} failed\n`,
	);
}

// ---------------------------------------------------------------------------
// Step 5: Seed engagement metrics
// ---------------------------------------------------------------------------

async function seedEngagement(
	creatorMappings: CreatorMapping[],
	seriesMappings: SeriesMapping[],
): Promise<void> {
	console.log("\n=== Step 5: Seeding engagement metrics ===\n");

	const engagement = generateEngagement(MOCK_SERIES, MOCK_CREATORS.length);

	// Update series view counts
	for (const sv of engagement.seriesViews) {
		const mapping = seriesMappings[sv.seriesIndex];
		if (!mapping) continue;

		const { error } = await adminDb
			.from("series")
			.update({ view_count: sv.viewCount })
			.eq("id", mapping.seriesId);

		if (error) {
			console.error(
				`  Failed to update views for ${mapping.slug}:`,
				error.message,
			);
		}
	}
	console.log(`  Updated view counts for ${engagement.seriesViews.length} series`);

	// Update creator follower counts directly (no follower rows since purchases table
	// requires real Stripe session IDs and followers table triggers handle count)
	for (const cf of engagement.creatorFollowers) {
		const creator = creatorMappings.find(
			(m) => m.creatorIndex === cf.creatorIndex,
		);
		if (!creator) continue;

		const { error } = await adminDb
			.from("profiles")
			.update({ follower_count: cf.followerCount })
			.eq("id", creator.userId);

		if (error) {
			console.error(
				`  Failed to update follower count for creator ${cf.creatorIndex}:`,
				error.message,
			);
		}
	}
	console.log(
		`  Updated follower counts for ${engagement.creatorFollowers.length} creators`,
	);

	// Skip purchase records -- purchases table requires stripe_session_id (UNIQUE NOT NULL)
	// which can't be meaningfully mocked without Stripe. View counts and follower counts
	// are sufficient for demo/pitch purposes.
	console.log(
		`  Skipped purchase records (requires real Stripe session IDs)\n`,
	);
}

// ---------------------------------------------------------------------------
// Step 6: Set featured flags
// ---------------------------------------------------------------------------

async function seedFeatured(seriesMappings: SeriesMapping[]): Promise<void> {
	console.log("\n=== Step 6: Setting featured flags ===\n");

	// Featured series -- curated selection
	const featuredSlugs = [
		"mock-aegis-protocol", // Sci-Fi
		"mock-sleep-study", // Horror
		"mock-flashpoint", // Action
	];

	let featuredCount = 0;
	for (const slug of featuredSlugs) {
		const mapping = seriesMappings.find((m) => m.slug === slug);
		if (!mapping) {
			console.warn(`  [SKIP] Featured series not found: ${slug}`);
			continue;
		}

		const { error } = await adminDb
			.from("series")
			.update({
				is_featured: true,
				featured_sort_order: featuredCount,
			})
			.eq("id", mapping.seriesId);

		if (error) {
			console.error(
				`  Failed to feature ${slug}:`,
				error.message,
			);
		} else {
			console.log(`  Featured: ${slug}`);
			featuredCount++;
		}
	}

	console.log(`\n  Set ${featuredCount} series as featured\n`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	console.log("============================================");
	console.log("  Shardz Seed Script");
	console.log("============================================");
	console.log(`  Series: ${MOCK_SERIES.length}`);
	console.log(`  Creators: ${MOCK_CREATORS.length}`);
	console.log(`  Start: ${new Date().toISOString()}`);
	console.log("============================================\n");

	const startTime = Date.now();

	try {
		// Step 1: Auth users + profiles
		const creatorMappings = await seedCreators();
		if (creatorMappings.length === 0) {
			throw new Error("No creators were created. Cannot proceed.");
		}

		// Step 2: Upload thumbnails
		const thumbnailUrls = await seedThumbnails(creatorMappings);

		// Step 3: Series/seasons/episodes hierarchy
		const seriesMappings = await seedContent(
			creatorMappings,
			thumbnailUrls,
		);
		if (seriesMappings.length === 0) {
			throw new Error("No series were created. Cannot proceed.");
		}

		// Step 4: Mux video ingestion
		await seedVideo(seriesMappings);

		// Step 5: Engagement metrics
		await seedEngagement(creatorMappings, seriesMappings);

		// Step 6: Featured flags
		await seedFeatured(seriesMappings);

		const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
		console.log("============================================");
		console.log("  Seed complete!");
		console.log(`  Duration: ${elapsed}s`);
		console.log(`  Creators: ${creatorMappings.length}`);
		console.log(`  Series: ${seriesMappings.length}`);
		console.log(
			`  Episodes: ${seriesMappings.reduce((a, s) => a + s.seasons.reduce((b, sn) => b + sn.episodes.length, 0), 0)}`,
		);
		console.log(`  Thumbnails: ${thumbnailUrls.size}`);
		console.log("============================================");
	} catch (err) {
		console.error("\nSeed failed:", err);
		process.exit(1);
	}
}

main();
