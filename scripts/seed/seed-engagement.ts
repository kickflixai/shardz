/**
 * Shardz Engagement Seed Script
 *
 * Populates the `episode_comments` and `episode_reactions` tables with realistic
 * mock data. Comments are genre-aware and reactions follow natural peak patterns
 * aligned to dramatic beats in 15-second micro-short episodes.
 *
 * Usage: npx tsx scripts/seed/seed-engagement.ts
 *
 * Idempotent: clears all existing rows in both tables before inserting.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const db = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EpisodeRow {
	id: string;
	episode_number: number;
	title: string;
	season_id: string;
	seasons: {
		series_id: string;
		series: {
			slug: string;
			title: string;
			genre: string;
		};
	};
}

interface CommentInsert {
	episode_id: string;
	user_id: string;
	content: string;
	timestamp_seconds: number;
	is_flagged: boolean;
}

interface ReactionInsert {
	episode_id: string;
	timestamp_seconds: number;
	emoji: string;
	count: number;
}

// ---------------------------------------------------------------------------
// Deterministic seeded RNG (consistent results across runs)
// ---------------------------------------------------------------------------

function seededRandom(seed: string): () => number {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = ((hash << 5) - hash + char) | 0;
	}
	return () => {
		hash = ((hash << 13) ^ hash) | 0;
		hash = (hash * 1540483477) | 0;
		hash = ((hash << 17) ^ hash) | 0;
		return ((hash < 0 ? ~hash : hash) % 10000) / 10000;
	};
}

function randomInt(rng: () => number, min: number, max: number): number {
	return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: () => number, arr: T[]): T {
	return arr[Math.floor(rng() * arr.length)];
}

// ---------------------------------------------------------------------------
// Comment templates by genre (20+ per genre)
// ---------------------------------------------------------------------------

const COMMENT_TEMPLATES: Record<string, string[]> = {
	"sci-fi": [
		"The VFX here are insane",
		"Plot twist incoming!",
		"Reminds me of Blade Runner",
		"The worldbuilding in 15 seconds is wild",
		"This is what sci-fi should be",
		"The sound design is everything",
		"Getting major Interstellar vibes",
		"How did they fit this much story in 15s??",
		"The lighting in this shot is gorgeous",
		"Cyberpunk perfection",
		"That hologram effect though",
		"I need a feature-length version immediately",
		"The attention to detail is staggering",
		"This makes mainstream sci-fi look lazy",
		"Every frame is a wallpaper",
		"The color grading is chef's kiss",
		"Okay this is genuinely terrifying and beautiful",
		"The practical effects are so much better than CGI",
		"I've watched this 10 times already",
		"This creator understands the genre on another level",
		"The score elevates this to another dimension",
		"Getting Arrival meets Ex Machina energy",
		"This is peak cinema",
		"Absolute masterpiece",
	],
	thriller: [
		"My heart is racing",
		"I did NOT see that coming",
		"The tension is unreal",
		"CHILLS. Literal chills.",
		"I need to know what happens next",
		"The pacing is immaculate",
		"Who else is watching this at 2am",
		"This is better than most Netflix thrillers",
		"The sound design is doing HEAVY lifting here",
		"That reveal was perfectly timed",
		"I audibly gasped",
		"Hitchcock would be proud",
		"The camera work is so claustrophobic I love it",
		"Hold on let me catch my breath",
		"How is this only 15 seconds long",
		"Every rewatch I notice something new",
		"The actor's micro-expressions tell the whole story",
		"I'm stressed and I LOVE it",
		"This is the definition of edge-of-your-seat",
		"Please tell me there's a season 2",
		"Masterclass in building suspense",
		"This is peak cinema",
		"Absolute masterpiece",
	],
	comedy: [
		"I can't stop laughing",
		"This is gold",
		"The timing is perfect",
		"I just spit out my coffee",
		"The deadpan delivery is everything",
		"Send this to everyone you know",
		"I'm crying laughing right now",
		"This needs way more views",
		"The writing is so tight",
		"Rewatching just for that one line",
		"Comedy genius right here",
		"How do they keep topping themselves",
		"I didn't expect that punchline AT ALL",
		"This cast has incredible chemistry",
		"My stomach hurts from laughing",
		"This is the best thing on the internet today",
		"The improv energy is immaculate",
		"I keep quoting this to my friends",
		"Better than half the sitcoms on TV",
		"Showed this to my partner and now they're hooked",
		"The physical comedy is underrated here",
		"This is peak cinema",
		"Absolute masterpiece",
	],
	drama: [
		"The acting is incredible",
		"This scene hits different",
		"Powerful storytelling",
		"I'm not crying, you're crying",
		"The emotion in this performance is raw",
		"This deserves an award",
		"So much depth in so few seconds",
		"The cinematography is breathtaking",
		"That silence spoke louder than words",
		"Every frame drips with intention",
		"This is what real storytelling looks like",
		"I felt that in my soul",
		"The subtlety here is masterful",
		"Goosebumps from start to finish",
		"More people need to see this",
		"The way they use natural light is beautiful",
		"This reminds me why I love film",
		"Devastating and beautiful at the same time",
		"The writing is razor sharp",
		"I've never connected with a character this fast",
		"Layer after layer of meaning",
		"This is peak cinema",
		"Absolute masterpiece",
	],
	action: [
		"That was so intense!",
		"Best action sequence ever",
		"Edge of my seat",
		"The choreography is next level",
		"How did they shoot this in one take??",
		"My jaw is on the floor",
		"Better stunts than most blockbusters",
		"The energy is UNMATCHED",
		"This needs a bigger budget yesterday",
		"I felt that impact through my screen",
		"Adrenaline rush in 15 seconds flat",
		"The practical effects are insane",
		"Someone give this team a feature film deal",
		"Rewinding just for that move at 0:07",
		"The camera movement is so fluid",
		"This hits harder than most action movies",
		"Can't believe this is micro-short format",
		"The slow-mo was perfectly placed",
		"Explosive from the first frame",
		"That transition from close-up to wide was sick",
		"Give me 10 seasons of this",
		"This is peak cinema",
		"Absolute masterpiece",
	],
	horror: [
		"I jumped out of my chair",
		"The atmosphere is terrifying",
		"Creepy AF",
		"Watching this with all the lights on",
		"Nope nope nope nope NOPE",
		"The sound design made me physically uncomfortable",
		"This is scarier than most horror movies",
		"My skin is crawling",
		"How is 15 seconds this unsettling",
		"I can't unsee that last frame",
		"The buildup was perfect",
		"Don't watch this alone at night",
		"The practical horror effects are so good",
		"That jumpscare got me BAD",
		"The dread is palpable",
		"I paused three times because I was too scared",
		"This creator understands atmospheric horror",
		"Less is more and this proves it",
		"The implied horror is worse than showing it",
		"I'm sleeping with the lights on tonight",
		"Genuinely unsettling in the best way",
		"This is peak cinema",
		"Absolute masterpiece",
	],
	romance: [
		"My heart is so full right now",
		"The chemistry between them is electric",
		"I'm blushing through my screen",
		"This is the cutest thing I've ever seen",
		"The longing in that look says EVERYTHING",
		"I need them to be together IRL",
		"Butterflies. Actual butterflies.",
		"That slow smile at the end destroyed me",
		"Rooting for them so hard",
		"The tension between them is unbearable",
		"This is what love stories should be",
		"I've replayed this moment 20 times",
		"The soundtrack choice is perfection",
		"My single self did not need this today",
		"They said so much without saying anything",
		"The hand touch at 0:08 -- I SCREAMED",
		"Write a feature film about these two NOW",
		"This is romance done right",
		"The warm color palette matches the mood perfectly",
		"I am emotionally compromised",
		"So tender and genuine",
		"This is peak cinema",
		"Absolute masterpiece",
	],
	documentary: [
		"I had no idea about this, wow",
		"More people need to see this story",
		"The way this is told is so compelling",
		"Incredible perspective I never considered",
		"This changed how I think about the topic",
		"The research behind this must be immense",
		"Powerful and important storytelling",
		"I'm going down a rabbit hole after this",
		"The narration is so well done",
		"Facts presented beautifully",
		"Education and entertainment in perfect balance",
		"This format is perfect for bite-sized learning",
		"I shared this with my whole class",
		"The footage is stunning",
		"This deserves a full-length doc",
		"Learned more in 15s than in an hour elsewhere",
		"The editing rhythm is mesmerizing",
		"Can't believe this is real footage",
		"Subscribed immediately after this",
		"Informative and beautifully shot",
		"This is peak cinema",
		"Absolute masterpiece",
	],
	"behind-the-scenes": [
		"So cool to see the process!",
		"The amount of work that goes into this is insane",
		"Love seeing the creative process",
		"This makes me appreciate the final product even more",
		"The BTS is almost better than the actual show",
		"I could watch these all day",
		"So much talent behind the camera",
		"The dedication is inspiring",
		"This is why I love micro-shorts -- real craft",
		"The crew chemistry is amazing",
		"Learned so much from this one clip",
		"Makes me want to start creating",
		"The gear they use is fascinating",
		"Respect to the entire team",
		"The problem-solving on set is wild",
		"Love how transparent they are about the process",
		"This is real filmmaking",
		"The editing breakdown was super helpful",
		"Inspiring content for aspiring creators",
		"More BTS content please!",
		"This is peak cinema",
		"Absolute masterpiece",
	],
	music: [
		"This beat is stuck in my head",
		"The production quality is incredible",
		"Goosebumps from the first note",
		"How is this not on every playlist",
		"The visuals match the music perfectly",
		"I need the full track immediately",
		"The mix is so clean",
		"Shazam can't find this and I'm devastated",
		"The bass hits different on headphones",
		"This artist is about to blow up",
		"The melody is hauntingly beautiful",
		"Playing this on repeat all day",
		"The drop at 0:10 is EVERYTHING",
		"Musical storytelling at its finest",
		"The vocal performance gave me chills",
		"This is the future of music distribution",
		"The layering of instruments is so rich",
		"I can feel the emotion in every note",
		"Adding this to my favorites immediately",
		"The sound engineering is top tier",
		"This is peak cinema",
		"Absolute masterpiece",
	],
	sports: [
		"What an incredible play!",
		"The athleticism on display is unreal",
		"I've watched this 50 times and still get hyped",
		"The slow-mo replay is essential",
		"This is why I love sports content",
		"The camera angle on that shot was perfect",
		"Pure dedication and talent",
		"That footwork is insane",
		"The crowd reaction makes it so much better",
		"Legendary moment right here",
		"The commentary adds so much energy",
		"This needs to be in a hall of fame",
		"Chills every single time",
		"The training behind this must be brutal",
		"Sports content in 15s is actually perfect",
		"Highlight reel material",
		"The editing makes this feel like a movie",
		"Respect the grind",
		"This is what competition looks like",
		"Underrated athlete, deserves more recognition",
		"This is peak cinema",
		"Absolute masterpiece",
	],
};

// Fallback for any genre not explicitly listed
const GENERIC_COMMENTS: string[] = [
	"This is amazing content",
	"Can't wait for the next episode",
	"Sharing this with everyone",
	"The quality is outstanding",
	"More of this please!",
	"Incredible work by the creator",
	"This format is the future",
	"Rewatching immediately",
	"How do I get more of this",
	"The production value is insane",
	"Subscribed and staying",
	"This deserves way more views",
	"Best thing I've seen all week",
	"The talent here is undeniable",
	"15 seconds of pure art",
	"Blown away by this",
	"Tell your friends about this",
	"This platform is a goldmine",
	"Creator really outdid themselves",
	"Take my money",
	"This is peak cinema",
	"Absolute masterpiece",
];

// ---------------------------------------------------------------------------
// Available emojis and genre weighting
// ---------------------------------------------------------------------------

const ALL_EMOJIS = ["\u{1F525}", "\u2764\uFE0F", "\u{1F602}", "\u{1F62D}", "\u{1F62E}", "\u{1F44F}", "\u{1F4AF}"];

// Genre-specific emoji weight maps. Higher weight = more likely to appear.
// Indices correspond to ALL_EMOJIS: [fire, heart, laugh, cry, wow, clap, 100]
const GENRE_EMOJI_WEIGHTS: Record<string, number[]> = {
	"sci-fi":              [5, 2, 1, 1, 5, 2, 3],
	thriller:              [3, 2, 1, 4, 5, 2, 2],
	comedy:                [2, 2, 5, 1, 2, 3, 5],
	drama:                 [2, 5, 1, 5, 2, 3, 2],
	action:                [5, 2, 1, 1, 3, 5, 3],
	horror:                [3, 1, 1, 4, 5, 1, 2],
	romance:               [2, 5, 1, 3, 2, 3, 2],
	documentary:           [2, 3, 1, 2, 4, 4, 3],
	"behind-the-scenes":   [3, 3, 2, 1, 3, 4, 3],
	music:                 [4, 3, 1, 2, 3, 3, 4],
	sports:                [5, 2, 2, 1, 3, 5, 3],
};

const DEFAULT_EMOJI_WEIGHTS = [3, 3, 3, 2, 3, 3, 3];

// Peak reaction timestamps (dramatic beats in a 15s video)
const PEAK_TIMESTAMPS = new Set([3, 7, 12]);

// Peak comment timestamps (dramatic beats)
const COMMENT_PEAK_RANGES = [
	{ min: 5, max: 7 },
	{ min: 10, max: 12 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Pick a weighted-random emoji index based on genre-specific weights.
 */
function pickWeightedEmoji(rng: () => number, genre: string): string {
	const weights = GENRE_EMOJI_WEIGHTS[genre] ?? DEFAULT_EMOJI_WEIGHTS;
	const totalWeight = weights.reduce((sum, w) => sum + w, 0);
	let roll = rng() * totalWeight;
	for (let i = 0; i < weights.length; i++) {
		roll -= weights[i];
		if (roll <= 0) return ALL_EMOJIS[i];
	}
	return ALL_EMOJIS[ALL_EMOJIS.length - 1];
}

/**
 * Generate a biased timestamp that favours peak moments.
 * 60% chance of landing in a peak range, 40% anywhere 0-14.
 */
function generateCommentTimestamp(rng: () => number): number {
	if (rng() < 0.6) {
		const range = pick(rng, COMMENT_PEAK_RANGES);
		return randomInt(rng, range.min, range.max);
	}
	return randomInt(rng, 0, 14);
}

// ---------------------------------------------------------------------------
// Data generation
// ---------------------------------------------------------------------------

function generateCommentsForEpisode(
	rng: () => number,
	episodeId: string,
	genre: string,
	creatorIds: string[],
): CommentInsert[] {
	const templates = COMMENT_TEMPLATES[genre] ?? GENERIC_COMMENTS;
	const numComments = randomInt(rng, 3, 8);
	const comments: CommentInsert[] = [];

	// Track which templates we have used to avoid exact duplicates per episode
	const usedTemplates = new Set<string>();

	for (let i = 0; i < numComments; i++) {
		// Pick a template we haven't used in this episode yet
		let content: string;
		let attempts = 0;
		do {
			content = pick(rng, templates);
			attempts++;
		} while (usedTemplates.has(content) && attempts < 30);
		usedTemplates.add(content);

		comments.push({
			episode_id: episodeId,
			user_id: pick(rng, creatorIds),
			content,
			timestamp_seconds: generateCommentTimestamp(rng),
			is_flagged: false,
		});
	}

	return comments;
}

function generateReactionsForEpisode(
	rng: () => number,
	episodeId: string,
	genre: string,
): ReactionInsert[] {
	const reactions: ReactionInsert[] = [];

	// For each second 0-14, decide which emojis appear
	for (let ts = 0; ts <= 14; ts++) {
		const isPeak = PEAK_TIMESTAMPS.has(ts);

		// Sparse reactions: skip most non-peak seconds
		if (!isPeak && rng() < 0.6) continue;

		// At peak timestamps, generate 2-3 emoji entries; otherwise 1-2
		const numEmojis = isPeak ? randomInt(rng, 2, 3) : randomInt(rng, 1, 2);
		const usedEmojis = new Set<string>();

		for (let e = 0; e < numEmojis; e++) {
			let emoji: string;
			let attempts = 0;
			do {
				emoji = pickWeightedEmoji(rng, genre);
				attempts++;
			} while (usedEmojis.has(emoji) && attempts < 20);

			if (usedEmojis.has(emoji)) continue;
			usedEmojis.add(emoji);

			// Realistic counts: peaks get 3-8, normal gets 1-3
			const count = isPeak
				? randomInt(rng, 3, 8)
				: randomInt(rng, 1, 3);

			reactions.push({
				episode_id: episodeId,
				timestamp_seconds: ts,
				emoji,
				count,
			});
		}
	}

	return reactions;
}

// ---------------------------------------------------------------------------
// Batch insert helper
// ---------------------------------------------------------------------------

async function batchInsert<T extends Record<string, unknown>>(
	table: string,
	rows: T[],
	batchSize = 100,
): Promise<number> {
	let inserted = 0;

	for (let i = 0; i < rows.length; i += batchSize) {
		const batch = rows.slice(i, i + batchSize);
		const { error } = await db.from(table).insert(batch);

		if (error) {
			console.error(
				`  [ERROR] Failed to insert batch ${Math.floor(i / batchSize) + 1} into ${table}:`,
				error.message,
			);
		} else {
			inserted += batch.length;
		}
	}

	return inserted;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	console.log("============================================");
	console.log("  Shardz Engagement Seed Script");
	console.log("  (episode_comments + episode_reactions)");
	console.log("============================================");
	console.log(`  Start: ${new Date().toISOString()}`);
	console.log("============================================\n");

	const startTime = Date.now();

	// -----------------------------------------------------------------------
	// Step 1: Clear existing data (idempotent)
	// -----------------------------------------------------------------------
	console.log("=== Step 1: Clearing existing engagement data ===\n");

	await db
		.from("episode_reactions")
		.delete()
		.neq("id", "00000000-0000-0000-0000-000000000000");
	console.log("  Cleared episode_reactions");

	await db
		.from("episode_comments")
		.delete()
		.neq("id", "00000000-0000-0000-0000-000000000000");
	console.log("  Cleared episode_comments\n");

	// -----------------------------------------------------------------------
	// Step 2: Fetch published episodes with series genre info
	// -----------------------------------------------------------------------
	console.log("=== Step 2: Fetching published episodes ===\n");

	const { data: episodes, error: episodesError } = await db
		.from("episodes")
		.select(
			"id, episode_number, title, season_id, seasons!inner(series_id, series!inner(slug, title, genre))",
		)
		.eq("status", "published");

	if (episodesError) {
		console.error("  Failed to fetch episodes:", episodesError.message);
		process.exit(1);
	}

	if (!episodes || episodes.length === 0) {
		console.error("  No published episodes found. Run the main seed script first.");
		process.exit(1);
	}

	console.log(`  Found ${episodes.length} published episodes\n`);

	// -----------------------------------------------------------------------
	// Step 3: Fetch mock creator user IDs
	// -----------------------------------------------------------------------
	console.log("=== Step 3: Fetching mock creator profiles ===\n");

	const { data: creators, error: creatorsError } = await db
		.from("profiles")
		.select("id")
		.like("username", "mock_%");

	if (creatorsError) {
		console.error("  Failed to fetch creators:", creatorsError.message);
		process.exit(1);
	}

	if (!creators || creators.length === 0) {
		console.error("  No mock creator profiles found. Run the main seed script first.");
		process.exit(1);
	}

	const creatorIds = creators.map((c: { id: string }) => c.id);
	console.log(`  Found ${creatorIds.length} mock creators\n`);

	// -----------------------------------------------------------------------
	// Step 4: Generate comments and reactions
	// -----------------------------------------------------------------------
	console.log("=== Step 4: Generating engagement data ===\n");

	const rng = seededRandom("shardz-engagement-v1");
	const allComments: CommentInsert[] = [];
	const allReactions: ReactionInsert[] = [];

	for (let i = 0; i < episodes.length; i++) {
		const ep = episodes[i] as unknown as EpisodeRow;
		const genre = ep.seasons?.series?.genre ?? "drama";

		const comments = generateCommentsForEpisode(rng, ep.id, genre, creatorIds);
		allComments.push(...comments);

		const reactions = generateReactionsForEpisode(rng, ep.id, genre);
		allReactions.push(...reactions);

		if ((i + 1) % 50 === 0 || i === episodes.length - 1) {
			console.log(
				`  Processed ${i + 1}/${episodes.length} episodes (${allComments.length} comments, ${allReactions.length} reactions so far)`,
			);
		}
	}

	console.log(
		`\n  Total generated: ${allComments.length} comments, ${allReactions.length} reactions\n`,
	);

	// -----------------------------------------------------------------------
	// Step 5: Batch insert comments
	// -----------------------------------------------------------------------
	console.log("=== Step 5: Inserting comments ===\n");

	const commentsInserted = await batchInsert("episode_comments", allComments);
	console.log(`  Inserted ${commentsInserted}/${allComments.length} comments\n`);

	// -----------------------------------------------------------------------
	// Step 6: Batch insert reactions
	// -----------------------------------------------------------------------
	console.log("=== Step 6: Inserting reactions ===\n");

	const reactionsInserted = await batchInsert("episode_reactions", allReactions);
	console.log(`  Inserted ${reactionsInserted}/${allReactions.length} reactions\n`);

	// -----------------------------------------------------------------------
	// Summary
	// -----------------------------------------------------------------------
	const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
	console.log("============================================");
	console.log("  Engagement seed complete!");
	console.log(`  Duration: ${elapsed}s`);
	console.log(`  Episodes processed: ${episodes.length}`);
	console.log(`  Comments inserted: ${commentsInserted}`);
	console.log(`  Reactions inserted: ${reactionsInserted}`);
	console.log("============================================");
}

main();
