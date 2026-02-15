"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/modules/social/actions/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
	seriesId: string;
	initialFavorited: boolean;
	isAuthenticated: boolean;
	className?: string;
}

export function FavoriteButton({
	seriesId,
	initialFavorited,
	isAuthenticated,
	className,
}: FavoriteButtonProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [optimisticFavorited, setOptimisticFavorited] =
		useOptimistic(initialFavorited);

	function handleClick() {
		if (!isAuthenticated) {
			router.push(`/login?next=/series/${seriesId}`);
			return;
		}

		startTransition(async () => {
			setOptimisticFavorited(!optimisticFavorited);
			await toggleFavorite(seriesId);
		});
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isPending}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
				optimisticFavorited
					? "text-red-500 hover:text-red-600"
					: "text-muted-foreground hover:text-foreground",
				className,
			)}
			aria-label={
				optimisticFavorited
					? "Remove from favorites"
					: "Add to favorites"
			}
		>
			<Heart
				className={cn(
					"size-5 transition-all",
					optimisticFavorited && "fill-red-500",
				)}
			/>
			<span className="hidden sm:inline">
				{optimisticFavorited ? "Favorited" : "Favorite"}
			</span>
		</button>
	);
}
