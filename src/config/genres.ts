import type { Genre } from "@/db/types";

export const GENRE_CONFIG: Record<Genre, { label: string }> = {
	drama: { label: "Drama" },
	comedy: { label: "Comedy" },
	thriller: { label: "Thriller" },
	"sci-fi": { label: "Sci-Fi" },
	horror: { label: "Horror" },
	romance: { label: "Romance" },
	action: { label: "Action" },
	documentary: { label: "Documentary" },
	"behind-the-scenes": { label: "BTS" },
	music: { label: "Music" },
	sports: { label: "Sports" },
};

export const ALL_GENRES = Object.keys(GENRE_CONFIG) as Genre[];

export function getGenreLabel(genre: Genre): string {
	return GENRE_CONFIG[genre]?.label ?? genre;
}
