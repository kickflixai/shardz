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
import { MOCK_SERIES } from "./data/series";

// Configure fal.ai with API key from env
const falKey = process.env.FAL_KEY;
if (!falKey) {
	throw new Error("Missing FAL_KEY env var. Set it in .env.local.");
}
fal.config({ credentials: falKey });

const ASSETS_DIR = resolve(import.meta.dirname, "assets/thumbnails");

/**
 * Build a cinematic thumbnail prompt from series data.
 */
function buildPrompt(series: (typeof MOCK_SERIES)[number]): string {
	const genreStyles: Record<string, string> = {
		"sci-fi": "futuristic, neon lighting, space, high-tech, cinematic sci-fi",
		drama: "dramatic lighting, emotional, moody atmosphere, cinematic drama",
		comedy: "bright colors, playful, lighthearted, warm lighting, comedic energy",
		thriller: "dark shadows, suspenseful, tense atmosphere, noir lighting",
		horror: "eerie, dark, unsettling, fog, sinister lighting, horror atmosphere",
		romance: "warm golden light, soft focus, intimate, romantic atmosphere",
		action: "explosive, dynamic, high contrast, intense, cinematic action",
		documentary: "realistic, raw, natural lighting, journalistic, documentary style",
		"behind-the-scenes": "film set, cameras, production equipment, behind the scenes of filmmaking",
		music: "concert lighting, vibrant, musical energy, stage atmosphere",
		sports: "athletic, dynamic motion, competitive energy, sports photography",
	};

	const style = genreStyles[series.genre] || "cinematic, dramatic lighting";

	return `Cinematic movie poster thumbnail, ${style}. ${series.title}: ${series.description}. Ultra high quality, 4K, professional movie poster style, no text, no words, no letters.`;
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
					image_size: "landscape_16_9",
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
