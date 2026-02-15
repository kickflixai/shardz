import { cn } from "@/lib/utils";

type Variant = "investor" | "brand" | "advisor" | "creator" | "platform";

interface CTASectionProps {
	primaryCTA: { label: string; href: string };
	secondaryCTA?: { label: string; href: string };
	variant: Variant;
	tagline?: string;
}

const variantStyles: Record<
	Variant,
	{ primary: string; secondary: string; glowColor: string }
> = {
	investor: {
		primary: "bg-brand-yellow text-cinema-black hover:bg-brand-yellow-light",
		secondary:
			"border-brand-yellow text-brand-yellow hover:bg-brand-yellow/10",
		glowColor: "rgba(224,184,0,0.15)",
	},
	brand: {
		primary: "bg-teal-500 text-cinema-black hover:bg-teal-400",
		secondary: "border-teal-500 text-teal-400 hover:bg-teal-500/10",
		glowColor: "rgba(0,200,200,0.15)",
	},
	advisor: {
		primary: "bg-amber-500 text-cinema-black hover:bg-amber-400",
		secondary: "border-amber-500 text-amber-400 hover:bg-amber-500/10",
		glowColor: "rgba(218,165,32,0.15)",
	},
	creator: {
		primary: "bg-brand-yellow text-cinema-black hover:bg-brand-yellow-light",
		secondary:
			"border-brand-yellow text-brand-yellow hover:bg-brand-yellow/10",
		glowColor: "rgba(224,184,0,0.15)",
	},
	platform: {
		primary: "bg-brand-yellow text-cinema-black hover:bg-brand-yellow-light",
		secondary:
			"border-brand-yellow text-brand-yellow hover:bg-brand-yellow/10",
		glowColor: "rgba(224,184,0,0.15)",
	},
};

export function CTASection({
	primaryCTA,
	secondaryCTA,
	variant,
	tagline,
}: CTASectionProps) {
	const styles = variantStyles[variant];

	return (
		<section className="relative bg-cinema-black px-6 py-24 md:py-32">
			{/* Gradient glow behind CTA */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${styles.glowColor} 0%, transparent 70%)`,
				}}
			/>

			<div className="relative z-10 mx-auto max-w-3xl text-center">
				{/* MicroShort wordmark */}
				<div className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
					MicroShort
				</div>

				{/* Closing tagline */}
				{tagline && (
					<p className="mb-10 text-2xl font-bold text-white md:text-3xl">
						{tagline}
					</p>
				)}

				{/* CTAs */}
				<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
					<a
						href={primaryCTA.href}
						className={cn(
							"inline-flex items-center rounded-xl px-8 py-4 text-lg font-bold shadow-lg transition-colors",
							styles.primary,
						)}
					>
						{primaryCTA.label}
					</a>
					{secondaryCTA && (
						<a
							href={secondaryCTA.href}
							className={cn(
								"inline-flex items-center rounded-xl border-2 px-8 py-4 text-lg font-bold transition-colors",
								styles.secondary,
							)}
						>
							{secondaryCTA.label}
						</a>
					)}
				</div>
			</div>
		</section>
	);
}
