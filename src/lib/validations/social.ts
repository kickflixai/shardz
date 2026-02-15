import { z } from "zod/v4";

export const commentSchema = z.object({
	content: z
		.string()
		.transform((s) => s.trim())
		.pipe(
			z
				.string()
				.min(1, "Comment cannot be empty")
				.max(300, "Comment must be at most 300 characters"),
		),
	timestampSeconds: z
		.number()
		.int("Timestamp must be a whole number")
		.min(0, "Timestamp must be non-negative"),
});

export const profileUpdateSchema = z.object({
	displayName: z
		.string()
		.transform((s) => s.trim())
		.pipe(
			z
				.string()
				.min(2, "Display name must be at least 2 characters")
				.max(50, "Display name must be at most 50 characters"),
		),
	watchHistoryPublic: z.boolean().optional(),
});

export const reportSchema = z.object({
	contentType: z.enum(["comment", "series", "episode"]),
	contentId: z.string().uuid("Invalid content ID"),
	reason: z
		.string()
		.transform((s) => s.trim())
		.pipe(
			z
				.string()
				.min(10, "Reason must be at least 10 characters")
				.max(500, "Reason must be at most 500 characters"),
		),
});

export type CommentInput = z.infer<typeof commentSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ReportInput = z.infer<typeof reportSchema>;

export type SocialFormState = {
	success: boolean;
	message: string;
	errors?: Record<string, string[]>;
};
