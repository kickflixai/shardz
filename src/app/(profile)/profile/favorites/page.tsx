import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserFavorites } from "@/modules/social/queries/get-user-favorites";
import { Badge } from "@/components/ui/badge";
import { getGenreLabel } from "@/config/genres";
import type { Genre } from "@/db/types";

export default async function FavoritesPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?next=/profile/favorites");
	}

	const favorites = await getUserFavorites(user.id);

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<div className="mb-6 flex items-center gap-4">
				<Link
					href="/profile"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
					Back to Profile
				</Link>
			</div>

			<h1 className="text-2xl font-bold">My Favorites</h1>
			<p className="mt-1 text-muted-foreground">
				{favorites.length}{" "}
				{favorites.length === 1 ? "series" : "series"} saved
			</p>

			{favorites.length === 0 ? (
				<div className="py-16 text-center">
					<Heart className="mx-auto size-16 text-muted-foreground/40" />
					<p className="mt-4 text-lg text-muted-foreground">
						No favorites yet
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						Browse series to find content you love.
					</p>
					<Link
						href="/browse"
						className="mt-6 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
					>
						Browse Series
					</Link>
				</div>
			) : (
				<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					{favorites.map((fav) => (
						<Link
							key={fav.id}
							href={`/series/${fav.series.slug}`}
							className="group overflow-hidden rounded-xl border border-border bg-card transition-transform hover:scale-[1.02]"
						>
							<div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
								{fav.series.thumbnail_url ? (
									<img
										src={fav.series.thumbnail_url}
										alt={fav.series.title}
										className="h-full w-full object-cover transition-transform group-hover:scale-105"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center text-muted-foreground">
										<Heart className="size-8 opacity-40" />
									</div>
								)}
							</div>
							<div className="p-3">
								<h3 className="line-clamp-1 text-sm font-semibold">
									{fav.series.title}
								</h3>
								<p className="text-xs text-muted-foreground">
									{fav.creator.display_name}
								</p>
								<Badge
									variant="secondary"
									className="mt-2 text-xs"
								>
									{getGenreLabel(fav.series.genre as Genre)}
								</Badge>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
