import Image from "next/image";
import { cn } from "@/lib/utils";

type Variant = "investor" | "brand" | "advisor" | "creator" | "platform";

interface HeroSectionProps {
	headline: string;
	subheadline: string;
	variant: Variant;
	badge?: string;
	ctaLabel?: string;
	ctaHref?: string;
	backgroundImage?: string;
}

const variantStyles: Record<
	Variant,
	{ gradient: string; accentColor: string; glowColor: string }
> = {
	investor: {
		gradient:
			"from-[rgba(224,184,0,0.08)] via-transparent to-transparent",
		accentColor: "bg-brand-yellow text-cinema-black hover:bg-brand-yellow-light",
		glowColor: "rgba(224,184,0,0.06)",
	},
	brand: {
		gradient:
			"from-[rgba(0,200,200,0.08)] via-transparent to-transparent",
		accentColor: "bg-teal-500 text-cinema-black hover:bg-teal-400",
		glowColor: "rgba(0,200,200,0.06)",
	},
	advisor: {
		gradient:
			"from-[rgba(218,165,32,0.08)] via-transparent to-transparent",
		accentColor: "bg-amber-500 text-cinema-black hover:bg-amber-400",
		glowColor: "rgba(218,165,32,0.06)",
	},
	creator: {
		gradient:
			"from-[rgba(224,184,0,0.08)] via-transparent to-transparent",
		accentColor: "bg-brand-yellow text-cinema-black hover:bg-brand-yellow-light",
		glowColor: "rgba(224,184,0,0.06)",
	},
	platform: {
		gradient:
			"from-[rgba(224,184,0,0.10)] via-transparent to-transparent",
		accentColor: "bg-brand-yellow text-cinema-black hover:bg-brand-yellow-light",
		glowColor: "rgba(224,184,0,0.08)",
	},
};

export function HeroSection({
	headline,
	subheadline,
	variant,
	badge,
	ctaLabel,
	ctaHref,
	backgroundImage,
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
			{/* Optional background image */}
			{backgroundImage && (
				<>
					<Image
						src={backgroundImage}
						alt=""
						fill
						className="pointer-events-none object-cover"
						priority
					/>
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cinema-black/70 via-cinema-black/50 to-cinema-black" />
				</>
			)}

			{/* Radial glow matching variant */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${styles.glowColor} 0%, transparent 70%)`,
				}}
			/>

			{/* Subtle grain/noise texture overlay */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
				}}
			/>

			<div className="relative z-10 mx-auto max-w-4xl text-center animate-in fade-in duration-1000">
				{badge && (
					<div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cinema-muted">
						{badge}
					</div>
				)}
				<h1 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
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

			{/* Animated scroll indicator */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
				<svg
					className="h-6 w-6 text-cinema-muted/50"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="1.5"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m19.5 8.25-7.5 7.5-7.5-7.5"
					/>
				</svg>
			</div>
		</section>
	);
}
