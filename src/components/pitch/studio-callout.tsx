import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

interface StudioCalloutProps {
	variant?: "default" | "investor" | "compact";
}

export function StudioCallout({ variant = "default" }: StudioCalloutProps) {
	if (variant === "compact") {
		return (
			<div className="rounded-2xl border border-brand-yellow/20 bg-brand-yellow/[0.03] p-6">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-yellow/20 bg-brand-yellow/10">
						<GraduationCap className="h-6 w-6 text-brand-yellow" />
					</div>
					<div className="flex-1">
						<h3 className="text-base font-bold text-white">
							Shardz Studio: Free AI Filmmaking Training
						</h3>
						<p className="mt-0.5 text-sm text-cinema-muted">
							Expert-led courses from AI scripting to published series -- included for every creator.
						</p>
					</div>
					<Link
						href="/pitch/studio"
						className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-yellow transition-colors hover:text-brand-yellow-light"
					>
						Learn more
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		);
	}

	if (variant === "investor") {
		return (
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-4xl">
					<div className="rounded-2xl border border-brand-yellow/20 bg-brand-yellow/[0.03] p-8 md:p-12">
						<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-yellow/20 bg-brand-yellow/10">
							<GraduationCap className="h-7 w-7 text-brand-yellow" />
						</div>
						<div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">
							Competitive Moat
						</div>
						<h3 className="text-2xl font-bold text-white sm:text-3xl">
							Shardz Studio
						</h3>
						<p className="mt-4 max-w-2xl text-lg leading-relaxed text-cinema-muted">
							Free creator education = higher content quality = faster growth = defensible moat.
							Every creator on Shardz gets access to expert-led AI filmmaking training at no cost.
							Better creators make better content. Better content attracts more viewers. More viewers
							drive more revenue. The flywheel is built into the education layer.
						</p>
						<div className="mt-8 grid gap-4 sm:grid-cols-2">
							<div className="rounded-xl border border-white/5 bg-white/5 p-6 text-center">
								<div className="text-2xl font-extrabold text-cinema-muted/60">
									$30K+
								</div>
								<div className="mt-1 text-sm text-cinema-muted">
									Traditional film school
								</div>
							</div>
							<div className="rounded-xl border border-brand-yellow/20 bg-brand-yellow/5 p-6 text-center">
								<div className="text-2xl font-extrabold text-brand-yellow">
									Free
								</div>
								<div className="mt-1 text-sm text-white">
									Shardz Studio
								</div>
							</div>
						</div>
						<div className="mt-8">
							<Link
								href="/pitch/studio"
								className="inline-flex items-center gap-2 text-base font-bold text-brand-yellow transition-colors hover:text-brand-yellow-light"
							>
								Explore Shardz Studio
								<ArrowRight className="h-4 w-4" />
							</Link>
						</div>
					</div>
				</div>
			</section>
		);
	}

	// Default variant
	return (
		<section className="bg-cinema-black px-6 py-24 md:py-32">
			<div className="mx-auto max-w-4xl">
				<div className="rounded-2xl border border-brand-yellow/20 bg-brand-yellow/[0.03] p-8 md:p-12">
					<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-yellow/20 bg-brand-yellow/10">
						<GraduationCap className="h-7 w-7 text-brand-yellow" />
					</div>
					<h3 className="text-2xl font-bold text-white sm:text-3xl">
						Shardz Studio: Free AI Filmmaking Training
					</h3>
					<p className="mt-4 max-w-2xl text-lg leading-relaxed text-cinema-muted">
						Every creator gets free access to expert-led training -- from AI scripting to published series.
						Master the tools, learn the workflows, and go from idea to revenue without spending a dime
						on education. Shardz Studio is included with every creator account.
					</p>
					<div className="mt-8">
						<Link
							href="/pitch/studio"
							className="inline-flex items-center gap-2 rounded-xl bg-brand-yellow px-6 py-3 text-base font-bold text-cinema-black transition-colors hover:bg-brand-yellow-light"
						>
							Explore Shardz Studio
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
