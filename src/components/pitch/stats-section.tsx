import { cn } from "@/lib/utils";

type Variant = "investor" | "brand" | "advisor" | "creator";

interface Stat {
	label: string;
	value: string;
	description?: string;
}

interface StatsSectionProps {
	stats: Stat[];
	variant: Variant;
}

const variantAccent: Record<Variant, string> = {
	investor: "text-brand-yellow",
	brand: "text-teal-400",
	advisor: "text-amber-400",
	creator: "text-brand-yellow",
};

export function StatsSection({ stats, variant }: StatsSectionProps) {
	const accent = variantAccent[variant];

	return (
		<section className="bg-cinema-black px-6 py-24 md:py-32">
			<div className="mx-auto max-w-6xl">
				<div
					className={cn(
						"grid gap-6",
						stats.length === 3
							? "grid-cols-1 md:grid-cols-3"
							: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
					)}
				>
					{stats.map((stat) => (
						<div
							key={stat.label}
							className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm"
						>
							<div
								className={cn(
									"text-4xl font-extrabold tracking-tight md:text-5xl",
									accent,
								)}
							>
								{stat.value}
							</div>
							<div className="mt-2 text-base font-semibold text-white">
								{stat.label}
							</div>
							{stat.description && (
								<p className="mt-2 text-sm text-cinema-muted">
									{stat.description}
								</p>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
