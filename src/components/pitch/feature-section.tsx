import { cn } from "@/lib/utils";
import { RemotionFeatureLazy } from "./remotion-feature-lazy";
import type { CompositionName } from "./remotion-feature";

type Variant = "investor" | "brand" | "advisor" | "creator";

interface Feature {
	title: string;
	description: string;
	composition: CompositionName;
}

interface FeatureSectionProps {
	variant: Variant;
	features: Feature[];
}

const variantAccent: Record<Variant, string> = {
	investor: "text-brand-yellow",
	brand: "text-teal-400",
	advisor: "text-amber-400",
	creator: "text-brand-yellow",
};

export function FeatureSection({ variant, features }: FeatureSectionProps) {
	const accent = variantAccent[variant];

	return (
		<section className="bg-cinema-black px-6 py-16 md:py-24">
			<div className="mx-auto max-w-7xl">
				{features.map((feature, i) => {
					const isReversed = i % 2 === 1;

					return (
						<div
							key={feature.title}
							className={cn(
								"flex flex-col items-center gap-12 py-16 md:py-24 lg:flex-row lg:gap-20",
								isReversed && "lg:flex-row-reverse",
							)}
						>
							{/* Text side */}
							<div className="flex-1 text-center lg:text-left">
								<h3
									className={cn(
										"text-3xl font-bold tracking-tight sm:text-4xl",
										accent,
									)}
								>
									{feature.title}
								</h3>
								<p className="mt-4 text-lg leading-relaxed text-cinema-muted md:text-xl">
									{feature.description}
								</p>
							</div>

							{/* Animation side */}
							<div className="w-full flex-1 overflow-hidden rounded-xl border border-cinema-border bg-cinema-dark">
								<RemotionFeatureLazy composition={feature.composition} />
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
