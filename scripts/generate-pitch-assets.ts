/**
 * One-time script for generating cinematic hero background images for pitch pages.
 *
 * Usage: npx tsx scripts/generate-pitch-assets.ts
 *
 * Requires FAL_KEY environment variable set in .env.local.
 * Uses fal-ai/flux/dev model to generate 16:9 landscape images.
 *
 * Generated images are saved to public/pitch/ and committed to the repo.
 * Run this ONCE. Existing images are skipped automatically.
 */

import { fal } from "@fal-ai/client";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// Configure fal.ai with API key from env
const falKey = process.env.FAL_KEY;
if (!falKey) {
	throw new Error("Missing FAL_KEY env var. Set it in .env.local.");
}
fal.config({ credentials: falKey });

const OUTPUT_DIR = resolve(process.cwd(), "public/pitch");

interface PitchAsset {
	filename: string;
	prompt: string;
}

const assets: PitchAsset[] = [
	{
		filename: "hero-investor.jpg",
		prompt:
			"Abstract minimal macro photography of liquid gold flowing slowly over a matte black surface, creating elegant organic curves and pools of warm amber light against deep darkness. Extremely shallow depth of field, soft bokeh, the gold has a molten metallic sheen catching a single directional light source. Clean, luxurious, minimal composition with vast negative space in pure black. No objects, no text, no people. Ultra high quality, 8K.",
	},
	{
		filename: "hero-brand.jpg",
		prompt:
			"Abstract minimal macro photograph of soft teal and cyan light refracting through dark crystal glass prisms on a pure black background. Gentle caustic light patterns scatter across the dark surface creating delicate geometric shapes. Extremely shallow depth of field, ethereal glow, clean minimalist composition with expansive negative dark space. No objects, no text, no people. Ultra high quality, 8K.",
	},
	{
		filename: "hero-advisor.jpg",
		prompt:
			"Abstract minimal macro photograph of warm amber and gold light filaments suspended in darkness, resembling delicate neural connections or constellation lines against a deep black void. Subtle warm glow, extremely fine luminous threads creating an elegant sparse network pattern. Clean luxurious minimalist composition with vast dark negative space. No objects, no text, no people. Ultra high quality, 8K.",
	},
	{
		filename: "hero-creator.jpg",
		prompt:
			"Abstract minimal macro photograph of a single droplet of molten gold splashing in extreme slow motion against a pure matte black surface, captured at the moment of impact with a perfect golden crown formation. Warm amber highlights, dramatic single-source lighting from above, extremely shallow depth of field with soft dark bokeh. Clean minimalist composition, vast black negative space. No objects, no text, no people. Ultra high quality, 8K.",
	},
	{
		filename: "hero-platform.jpg",
		prompt:
			"Abstract minimal photograph of parallel golden light rays cutting diagonally through a dark atmospheric haze against a pure black background, creating elegant geometric lines of warm amber illumination. Volumetric light, subtle dust particles catching the glow, clean modernist composition with vast dark negative space on both sides. No objects, no text, no people. Ultra high quality, 8K.",
	},
];

/**
 * Delay utility for rate limiting between API requests.
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
	// Ensure output directory exists
	if (!existsSync(OUTPUT_DIR)) {
		await mkdir(OUTPUT_DIR, { recursive: true });
	}

	console.log(`Generating ${assets.length} pitch hero backgrounds...`);
	console.log(`Output directory: ${OUTPUT_DIR}\n`);

	for (let i = 0; i < assets.length; i++) {
		const asset = assets[i];
		const outputPath = resolve(OUTPUT_DIR, asset.filename);

		// Skip if image already exists
		if (existsSync(outputPath)) {
			console.log(`[${i + 1}/${assets.length}] SKIP ${asset.filename} (already exists)`);
			continue;
		}

		console.log(`[${i + 1}/${assets.length}] Generating ${asset.filename}...`);

		try {
			const result = await fal.subscribe("fal-ai/flux/dev", {
				input: {
					prompt: asset.prompt,
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

		// Rate limit: 2.5 second delay between requests
		if (i < assets.length - 1) {
			await delay(2500);
		}
	}

	console.log("\nPitch hero background generation complete!");
}

main().catch((err) => {
	console.error("Pitch asset generation failed:", err);
	process.exit(1);
});
