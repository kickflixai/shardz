import { cn } from "@/lib/utils";

type Variant = "investor" | "brand" | "advisor" | "creator";

interface HeroSectionProps {
	headline: string;
	subheadline: string;
	variant: Variant;
	ctaLabel?: string;
	ctaHref?: string;
}

const variantStyles: Record<
	Variant,
	{ gradient: string; accentColor: string }
> = {
	investor: {
		gradient:
			"from-[rgba(224,184,0,0.08)] via-transparent to-transparent",
		accentColor: "bg-brand-yellow text-cinema-black hover:bg-brand-yellow-light",
	},
	brand: {
		gradient:
			"from-[rgba(0,200,200,0.08)] via-transparent to-transparent",
		accentColor: "bg-teal-500 text-cinema-black hover:bg-teal-400",
	},
	advisor: {
		gradient:
			"from-[rgba(218,165,32,0.08)] via-transparent to-transparent",
		accentColor: "bg-amber-500 text-cinema-black hover:bg-amber-400",
	},
	creator: {
		gradient:
			"from-[rgba(224,184,0,0.08)] via-transparent to-transparent",
		accentColor: "bg-brand-yellow text-cinema-black hover:bg-brand-yellow-light",
	},
};

export function HeroSection({
	headline,
	subheadline,
	variant,
	ctaLabel,
	ctaHref,
}: HeroSectionProps) {
	const styles = variantStyles[variant];

	return (
		<section
			className={cn(
				"relative flex min-h-screen items-center justify-center overflow-hidden bg-cinema-black px-6",
				"bg-gradient-to-b",
				styles.gradient,
			)}
		>
			{/* Subtle radial glow */}
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(224,184,0,0.04)_0%,transparent_70%)]" />

			<div className="relative z-10 mx-auto max-w-4xl text-center animate-in fade-in duration-1000">
				<h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
					{headline}
				</h1>
				<p className="mx-auto mt-6 max-w-2xl text-lg text-cinema-muted sm:text-xl md:text-2xl">
					{subheadline}
				</p>
				{ctaLabel && ctaHref && (
					<div className="mt-10">
						<a
							href={ctaHref}
							className={cn(
								"inline-flex items-center rounded-xl px-8 py-4 text-lg font-bold transition-colors",
								styles.accentColor,
							)}
						>
							{ctaLabel}
						</a>
					</div>
				)}
			</div>
		</section>
	);
}
