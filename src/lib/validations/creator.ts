import { z } from "zod/v4";

export const applicationSchema = z.object({
	displayName: z
		.string()
		.min(2, "Display name must be at least 2 characters")
		.max(50, "Display name must be at most 50 characters"),
	bio: z
		.string()
		.min(20, "Tell us about yourself (at least 20 characters)")
		.max(500, "Bio must be at most 500 characters"),
	portfolioUrl: z
		.union([z.url("Please enter a valid URL"), z.literal("")])
		.optional(),
	portfolioDescription: z
		.string()
		.min(20, "Portfolio description must be at least 20 characters")
		.max(1000, "Portfolio description must be at most 1000 characters"),
	socialLinks: z.string().optional(),
});

export const seriesSchema = z.object({
	title: z
		.string()
		.min(2, "Title must be at least 2 characters")
		.max(100, "Title must be at most 100 characters"),
	description: z.string().max(2000, "Description must be at most 2000 characters").optional(),
	genre: z.enum([
		"drama",
		"comedy",
		"thriller",
		"sci-fi",
		"horror",
		"romance",
		"action",
		"documentary",
		"behind-the-scenes",
		"music",
		"sports",
	]),
});

export const seasonSchema = z.object({
	title: z.string().max(100, "Title must be at most 100 characters").optional(),
	description: z.string().max(2000, "Description must be at most 2000 characters").optional(),
	priceTierId: z.string().uuid("Please select a price tier"),
	releaseStrategy: z.enum(["all_at_once", "drip"]),
});

export const episodeSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(100, "Title must be at most 100 characters"),
	description: z.string().max(2000, "Description must be at most 2000 characters").optional(),
	contentWarnings: z.string().optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type SeriesInput = z.infer<typeof seriesSchema>;
export type SeasonInput = z.infer<typeof seasonSchema>;
export type EpisodeInput = z.infer<typeof episodeSchema>;

export type CreatorFormState = {
	values?: Record<string, string>;
	errors: Record<string, string[]> | null;
	success: boolean;
	message?: string;
};
