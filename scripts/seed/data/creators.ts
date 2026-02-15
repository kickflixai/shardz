/**
 * Mock creator persona definitions for seeding MicroShort.
 *
 * Each creator has a unique personality, background, and creative voice.
 * All data is pure TypeScript -- no database calls, no side effects.
 *
 * Consumed by the seed execution script (08-02).
 */

export interface MockCreator {
	email: string;
	password: string;
	username: string;
	displayName: string;
	bio: string;
	avatarUrl: string | null;
	socialLinks: Record<string, string>;
}

/**
 * 12 creator personas covering diverse creative backgrounds.
 *
 * All emails use @mock.microshort.dev for deterministic idempotency.
 * All usernames prefixed with mock_ for clear identification and easy cleanup.
 * Same password for all mock creators (dev-only).
 */
export const MOCK_CREATORS: MockCreator[] = [
	{
		email: "nova-chen@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_novachen",
		displayName: "Nova Chen",
		bio: "AI filmmaker and visual storyteller. Former VFX artist at Weta, now creating micro-cinema that blends photorealism with surreal atmospheres. Obsessed with what happens when you give machines a camera.",
		avatarUrl: null,
		socialLinks: {
			"twitter.com": "https://twitter.com/novachenfilms",
			"instagram.com": "https://instagram.com/novachenfilms",
		},
	},
	{
		email: "marcus-reed@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_marcusreed",
		displayName: "Marcus Reed",
		bio: "Stand-up comic turned micro-filmmaker. My shorts are basically bits with better lighting. If a joke can land in 90 seconds, it deserves its own episode.",
		avatarUrl: null,
		socialLinks: {
			"twitter.com": "https://twitter.com/marcusreedcomedy",
			"youtube.com": "https://youtube.com/@marcusreed",
		},
	},
	{
		email: "aya-nakamura@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_ayanakamura",
		displayName: "Aya Nakamura",
		bio: "Thriller and horror director. I make the kind of micro-films that keep you checking behind you after watching. Every frame is a trap.",
		avatarUrl: null,
		socialLinks: {
			"instagram.com": "https://instagram.com/ayanakamurafilms",
			"letterboxd.com": "https://letterboxd.com/ayanakamura",
		},
	},
	{
		email: "diego-morales@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_diegomorales",
		displayName: "Diego Morales",
		bio: "Documentary filmmaker capturing untold stories in 3 minutes or less. Former photojournalist. Every person is a feature film -- I just show the trailer.",
		avatarUrl: null,
		socialLinks: {
			"twitter.com": "https://twitter.com/diegodocs",
			"vimeo.com": "https://vimeo.com/diegomorales",
		},
	},
	{
		email: "sarah-okonkwo@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_sarahokonkwo",
		displayName: "Sarah Okonkwo",
		bio: "Romance and drama creator. I believe love stories deserve the same cinematic treatment as blockbusters -- just compressed into moments that matter.",
		avatarUrl: null,
		socialLinks: {
			"instagram.com": "https://instagram.com/sarahokonkwofilms",
			"tiktok.com": "https://tiktok.com/@sarahokonkwo",
		},
	},
	{
		email: "jake-thornton@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_jakethornton",
		displayName: "Jake Thornton",
		bio: "Action filmmaker and former stunt coordinator. I pack more adrenaline into 2 minutes than most films do in 2 hours. Practical effects only -- no shortcuts.",
		avatarUrl: null,
		socialLinks: {
			"youtube.com": "https://youtube.com/@jakethorntonaction",
			"instagram.com": "https://instagram.com/jakethornton",
		},
	},
	{
		email: "luna-park@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_lunapark",
		displayName: "Luna Park",
		bio: "Music video director and visual artist. I create sonic micro-worlds where every cut hits on the beat. Formerly at Pulse Films, now independent.",
		avatarUrl: null,
		socialLinks: {
			"instagram.com": "https://instagram.com/lunaparkvisuals",
			"spotify.com": "https://open.spotify.com/user/lunapark",
		},
	},
	{
		email: "omar-hassan@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_omarhassan",
		displayName: "Omar Hassan",
		bio: "Sports documentary creator. From locker rooms to last-second plays, I capture the human side of competition. Every athlete has a story worth 90 seconds.",
		avatarUrl: null,
		socialLinks: {
			"twitter.com": "https://twitter.com/omarhasansports",
			"youtube.com": "https://youtube.com/@omarsportsdocs",
		},
	},
	{
		email: "ivy-zhang@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_ivyzhang",
		displayName: "Ivy Zhang",
		bio: "Sci-fi worldbuilder and concept artist turned filmmaker. I design futures first, then film them. Every series starts with a 50-page universe bible.",
		avatarUrl: null,
		socialLinks: {
			"twitter.com": "https://twitter.com/ivyzhangscifi",
			"artstation.com": "https://artstation.com/ivyzhang",
		},
	},
	{
		email: "carlos-vega@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_carlosvega",
		displayName: "Carlos Vega",
		bio: "BTS and making-of content creator. I pull back the curtain on filmmaking itself. My series show what happens between 'action' and 'cut' -- the real magic.",
		avatarUrl: null,
		socialLinks: {
			"youtube.com": "https://youtube.com/@carlosvegabts",
			"twitter.com": "https://twitter.com/carlosvegabts",
		},
	},
	{
		email: "elena-volkov@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_elenavolkov",
		displayName: "Elena Volkov",
		bio: "Dark comedy and absurdist filmmaker. My work lives in that uncomfortable space between laughing and cringing. If you're not sure whether to laugh -- good.",
		avatarUrl: null,
		socialLinks: {
			"letterboxd.com": "https://letterboxd.com/elenavolkov",
			"instagram.com": "https://instagram.com/elenavolkovfilms",
		},
	},
	{
		email: "ty-washington@mock.microshort.dev",
		password: "MockCreator123!",
		username: "mock_tywashington",
		displayName: "Ty Washington",
		bio: "Drama creator exploring identity, family, and what it means to belong. My micro-films are conversations you wish you could have -- but in someone else's living room.",
		avatarUrl: null,
		socialLinks: {
			"instagram.com": "https://instagram.com/tywashingtonfilms",
			"twitter.com": "https://twitter.com/tywashington",
		},
	},
];
