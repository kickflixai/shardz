/**
 * Shared constants for the social engagement module.
 * Extracted from server actions so client components can import without
 * crossing the "use server" boundary.
 */

export const REACTION_EMOJIS = [
	"\uD83D\uDD25",
	"\u2764\uFE0F",
	"\uD83D\uDE02",
	"\uD83D\uDE2D",
	"\uD83D\uDE2E",
	"\uD83D\uDC4F",
	"\uD83D\uDCAF",
] as const;

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];
