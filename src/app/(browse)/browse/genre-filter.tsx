"use client";

import { useQueryState, parseAsString } from "nuqs";
import { GENRE_CONFIG, ALL_GENRES } from "@/config/genres";
import type { Genre } from "@/db/types";

export function GenreFilter() {
	const [genre, setGenre] = useQueryState(
		"genre",
		parseAsString.withOptions({ history: "push" }),
	);

	const activeGenre = genre ?? "all";

	return (
		<div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
			<button
				type="button"
				onClick={() => setGenre(null)}
				className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
					activeGenre === "all"
						? "bg-primary text-primary-foreground"
						: "bg-muted text-muted-foreground hover:bg-muted/80"
				}`}
			>
				All
			</button>
			{ALL_GENRES.map((g: Genre) => (
				<button
					key={g}
					type="button"
					onClick={() => setGenre(g)}
					className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
						activeGenre === g
							? "bg-primary text-primary-foreground"
							: "bg-muted text-muted-foreground hover:bg-muted/80"
					}`}
				>
					{GENRE_CONFIG[g].label}
				</button>
			))}
		</div>
	);
}
