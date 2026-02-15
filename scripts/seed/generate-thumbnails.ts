/**
 * One-time script for generating AI thumbnails via fal.ai Flux model.
 *
 * Usage: pnpm seed:thumbnails
 *
 * This script generates unique AI thumbnails for each mock series and saves
 * them to scripts/seed/assets/thumbnails/{series-slug}.png.
 *
 * Run this ONCE. Generated images are committed to the repo and uploaded
 * by the seed script. NOT run on every seed.
 */

import { fal } from "@fal-ai/client";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MOCK_SERIES } from "./data/series";

// Configure fal.ai with API key from env
const falKey = process.env.FAL_KEY;
if (!falKey) {
	throw new Error("Missing FAL_KEY env var. Set it in .env.local.");
}
fal.config({ credentials: falKey });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ASSETS_DIR = resolve(__dirname, "assets/thumbnails");

/**
 * Build a cinematic movie poster prompt from series data.
 * Generates posters with the series title as prominent text.
 */
function buildPrompt(series: (typeof MOCK_SERIES)[number]): string {
	const genreStyles: Record<string, string> = {
		"sci-fi":
			"futuristic neon cyberpunk palette, deep space blues and electric cyan, lens flares, volumetric fog",
		drama:
			"moody golden hour lighting, dramatic chiaroscuro, warm amber and deep shadows",
		comedy:
			"vibrant saturated colors, playful warm lighting, bright inviting palette",
		thriller:
			"noir shadows, deep blacks and cold steel blues, rain-slicked surfaces, tension",
		horror:
			"eerie desaturated tones, sinister red accents, fog, darkness, dread atmosphere",
		romance:
			"warm golden bokeh, soft rose and amber tones, intimate dreamy atmosphere",
		action:
			"explosive orange and teal, high contrast, sparks, motion blur, adrenaline energy",
		documentary:
			"raw photojournalistic feel, natural lighting, gritty textures, authentic",
		"behind-the-scenes":
			"film set atmosphere, camera rigs, production lights, creative energy",
		music:
			"concert stage lighting, vibrant neon, musical energy, atmospheric haze",
		sports:
			"athletic power, dynamic frozen motion, stadium lights, competitive intensity",
	};

	const style = genreStyles[series.genre] || "cinematic, dramatic lighting";

	return `Professional movie poster artwork for a short-form series called "${series.title}". The title "${series.title}" should be displayed prominently in bold cinematic typography as the focal text element of the poster. ${style}. ${series.description}. Designed as a premium streaming series poster, ultra high quality, 4K, edge-to-edge composition filling the entire frame, professional movie poster layout with the series title as large readable text.`;
}

/**
 * Delay utility for rate limiting.
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
	// Ensure output directory exists
	if (!existsSync(ASSETS_DIR)) {
		await mkdir(ASSETS_DIR, { recursive: true });
	}

	console.log(`Generating thumbnails for ${MOCK_SERIES.length} series...`);
	console.log(`Output directory: ${ASSETS_DIR}\n`);

	for (let i = 0; i < MOCK_SERIES.length; i++) {
		const series = MOCK_SERIES[i];
		const outputPath = resolve(ASSETS_DIR, `${series.slug}.png`);

		// Skip if thumbnail already exists
		if (existsSync(outputPath)) {
			console.log(`[${i + 1}/${MOCK_SERIES.length}] SKIP ${series.slug} (already exists)`);
			continue;
		}

		const prompt = buildPrompt(series);
		console.log(`[${i + 1}/${MOCK_SERIES.length}] Generating ${series.slug}...`);

		try {
			const result = await fal.subscribe("fal-ai/flux/dev", {
				input: {
					prompt,
					image_size: "portrait_4_3",
				},
				pollInterval: 3000,
			});

			const imageUrl = (result.data as { images: { url: string }[] }).images[0].url;
			const response = await fetch(imageUrl);
			const buffer = Buffer.from(await response.arrayBuffer());
			await writeFile(outputPath, buffer);

			console.log(`  -> Saved to ${outputPath}`);
		} catch (err) {
			console.error(`  -> FAILED: ${err instanceof Error ? err.message : err}`);
		}

		// Rate limit: 2-3 second delay between requests
		if (i < MOCK_SERIES.length - 1) {
			await delay(2500);
		}
	}

	console.log("\nThumbnail generation complete!");
}

main().catch((err) => {
	console.error("Thumbnail generation failed:", err);
	process.exit(1);
});
