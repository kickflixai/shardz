import { DollarSign } from "lucide-react";

const earningsExamples = [
	{ fans: 100, price: "$4.99", earnings: "$399", label: "Getting started" },
	{ fans: 500, price: "$4.99", earnings: "$1,996", label: "Building momentum" },
	{ fans: 2000, price: "$4.99", earnings: "$7,984", label: "Real revenue" },
	{ fans: 10000, price: "$4.99", earnings: "$39,920", label: "Full-time income" },
];

interface CreatorEconomicsProps {
	compact?: boolean;
}

export function CreatorEconomics({ compact = false }: CreatorEconomicsProps) {
	return (
		<section className={`bg-cinema-black px-6 ${compact ? "py-16 md:py-20" : "py-24 md:py-32"}`}>
			<div className="mx-auto max-w-5xl">
				<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
					Transparent Economics
				</h2>
				<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
					Know exactly what you earn
				</p>

				{/* Revenue split visualization */}
				<div className="mx-auto mb-16 max-w-2xl">
					<div className="overflow-hidden rounded-2xl border border-white/5">
						{/* Creator share - 80% */}
						<div className="flex items-center justify-between bg-brand-yellow/10 px-8 py-6">
							<div>
								<div className="text-5xl font-extrabold text-brand-yellow md:text-6xl">
									80%
								</div>
								<div className="mt-1 text-lg font-bold text-white">
									You keep
								</div>
							</div>
							<div className="text-right text-sm text-cinema-muted">
								Your content, your revenue
							</div>
						</div>
						{/* Platform share - 20% */}
						<div className="flex items-center justify-between border-t border-white/5 bg-white/5 px-8 py-4">
							<div>
								<div className="text-2xl font-bold text-cinema-muted">
									20%
								</div>
								<div className="mt-0.5 text-sm text-cinema-muted">
									Platform
								</div>
							</div>
							<div className="text-right text-sm text-cinema-muted">
								Hosting, payments, discovery
							</div>
						</div>
					</div>
				</div>

				{/* Concrete earnings examples */}
				<div className={compact ? "mb-0" : "mb-16"}>
					<h3 className="mb-8 text-center text-xl font-bold text-white">
						What the math looks like
					</h3>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{earningsExamples.map((ex) => (
							<div
								key={ex.fans}
								className="rounded-2xl border border-brand-yellow/10 bg-brand-yellow/[0.03] p-6 text-center transition-colors hover:border-brand-yellow/20"
							>
								<div className="mb-1 text-xs font-bold uppercase tracking-wider text-cinema-muted">
									{ex.label}
								</div>
								<div className="mb-3 text-3xl font-extrabold text-brand-yellow">
									{ex.earnings}
								</div>
								<div className="flex items-center justify-center gap-1 text-sm text-cinema-muted">
									<DollarSign className="h-3.5 w-3.5" />
									{ex.fans} fans x {ex.price}
								</div>
								<div className="mt-1 text-xs text-cinema-muted/60">
									in your pocket
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Economics comparison cards — hidden in compact mode */}
				{!compact && (
					<div className="grid gap-6 sm:grid-cols-3">
						<div className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
							<div className="mb-2 text-xs font-bold uppercase tracking-widest text-cinema-muted">
								Ad-Based Platforms
							</div>
							<div className="text-3xl font-extrabold text-cinema-muted/60">
								$0.003
							</div>
							<div className="mt-1 text-sm text-cinema-muted">
								Average revenue per view
							</div>
							<div className="mt-3 text-xs text-cinema-muted/60">
								You need 100,000 views to earn $300
							</div>
						</div>

						<div className="rounded-2xl border border-brand-yellow/20 bg-brand-yellow/5 p-8 backdrop-blur-sm">
							<div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-yellow">
								Shardz
							</div>
							<div className="text-3xl font-extrabold text-brand-yellow">
								$3.99
							</div>
							<div className="mt-1 text-sm text-white">
								You earn per season unlock
							</div>
							<div className="mt-3 text-xs text-cinema-muted">
								One fan, one purchase, real revenue in your pocket
							</div>
						</div>

						<div className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
							<div className="mb-2 text-xs font-bold uppercase tracking-widest text-cinema-muted">
								The Math
							</div>
							<div className="text-3xl font-extrabold text-white">
								$7,984
							</div>
							<div className="mt-1 text-sm text-cinema-muted">
								2,000 fans x $4.99 = $7,984 to you
							</div>
							<div className="mt-3 text-xs text-cinema-muted/60">
								Price per season: $0.99 - $9.99
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
