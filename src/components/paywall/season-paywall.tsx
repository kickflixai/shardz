import Image from "next/image";
import { formatPrice } from "@/lib/stripe/prices";
import { UnlockButton } from "@/components/paywall/unlock-button";

interface SeasonPaywallProps {
	seasonId: string;
	seriesSlug: string;
	seriesTitle: string;
	seasonTitle: string | null;
	seasonNumber: number;
	priceCents: number;
	totalEpisodes: number;
	episodeNumber: number;
	thumbnailUrl: string | null;
}

export function SeasonPaywall({
	seasonId,
	seriesSlug,
	seriesTitle,
	seasonTitle,
	seasonNumber,
	priceCents,
	totalEpisodes,
	episodeNumber,
	thumbnailUrl,
}: SeasonPaywallProps) {
	const seasonLabel = seasonTitle || `Season ${seasonNumber}`;

	return (
		<div className="relative w-full overflow-hidden rounded-xl">
			{/* Blurred background thumbnail */}
			{thumbnailUrl ? (
				<Image
					src={thumbnailUrl}
					alt=""
					fill
					className="object-cover blur-xl brightness-[0.3]"
					sizes="100vw"
					aria-hidden="true"
				/>
			) : (
				<div className="absolute inset-0 bg-gradient-to-b from-cinema-surface to-black" />
			)}

			{/* Overlay content */}
			<div className="relative flex min-h-[400px] flex-col items-center justify-center px-6 py-12">
				{/* Centered card */}
				<div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/70 px-8 py-10 text-center backdrop-blur-md">
					{/* Episode context */}
					<p className="text-sm font-medium text-muted-foreground">
						Episode {episodeNumber}
					</p>

					{/* Main heading */}
					<h2 className="mt-4 text-2xl font-bold text-foreground">
						Unlock all {totalEpisodes} episodes of {seasonLabel}
					</h2>

					{/* Series title */}
					<p className="mt-2 text-sm text-muted-foreground">
						{seriesTitle}
					</p>

					{/* Price */}
					<p className="mt-6 text-3xl font-bold text-brand-yellow">
						{formatPrice(priceCents)}
					</p>

					{/* Unlock button */}
					<div className="mt-6">
						<UnlockButton
							seasonId={seasonId}
							seriesSlug={seriesSlug}
							priceCents={priceCents}
							purchaseType="single"
						/>
					</div>

					{/* Subtext */}
					<p className="mt-4 text-xs text-muted-foreground">
						Instant access to all episodes after purchase
					</p>
				</div>
			</div>
		</div>
	);
}
