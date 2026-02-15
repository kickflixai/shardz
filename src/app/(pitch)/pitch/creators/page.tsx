import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/pitch/hero-section";
import { CTASection } from "@/components/pitch/cta-section";
import { StudioCallout } from "@/components/pitch/studio-callout";
import { CREATOR_TYPES } from "@/lib/pitch/creator-types";
import {
	ArrowRight,
	Upload,
	BarChart3,
	CreditCard,
	Percent,
} from "lucide-react";

export const metadata: Metadata = {
	title: "Shardz for Creators | Built for Every Kind of Creator",
	description:
		"Filmmakers, influencers, musicians, sports teams, AI filmmakers — Shardz gives every creator 80% revenue share, self-serve uploads, analytics, and Stripe payouts.",
};

const universalFeatures = [
	{
		icon: Percent,
		title: "80% Revenue Share",
		description:
			"You keep 80% of every sale. No ad dependency, no subscription pool dilution — direct-to-fan revenue.",
	},
	{
		icon: Upload,
		title: "Self-Serve Upload",
		description:
			"Upload your series, set your price, and start earning. No gatekeepers, no approval queues.",
	},
	{
		icon: BarChart3,
		title: "Full Analytics",
		description:
			"Track views, unlock rates, and revenue per series. Data-driven growth, not guesswork.",
	},
	{
		icon: CreditCard,
		title: "Stripe Payouts",
		description:
			"Automatic payouts via Stripe Connect. Transparent, reliable, and on your schedule.",
	},
];

export default function CreatorHubPage() {
	return (
		<main>
			{/* 1. Hero */}
			<HeroSection
				variant="creator"
				badge="For Creators"
				headline="Built for Every Kind of Creator"
				subheadline="Whether you make films, music, sports content, or AI cinema — Shardz is the platform where every format earns. Pick your path and see how it works for you."
			/>

			{/* 2. Creator Type Selection Grid */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						Choose Your Path
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						What kind of creator are you?
					</p>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{CREATOR_TYPES.map((ct) => {
							const Icon = ct.icon;
							return (
								<Link
									key={ct.slug}
									href={`/pitch/creators/${ct.slug}`}
									className="group rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-brand-yellow/20 hover:bg-brand-yellow/5"
								>
									<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-colors group-hover:border-brand-yellow/20 group-hover:bg-brand-yellow/10">
										<Icon className="h-7 w-7 text-cinema-muted transition-colors group-hover:text-brand-yellow" />
									</div>
									<h3 className="text-lg font-bold text-white">
										{ct.label}
									</h3>
									<p className="mt-1 text-sm text-cinema-muted">
										{ct.description}
									</p>
									<div className="mt-4 flex items-center gap-1.5 text-sm font-bold text-brand-yellow opacity-0 transition-opacity group-hover:opacity-100">
										See how it works
										<ArrowRight className="h-4 w-4" />
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			</section>

			{/* 3. What All Creators Get */}
			<section className="bg-gradient-to-b from-cinema-black via-[rgba(224,184,0,0.02)] to-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						Universal Benefits
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						What every creator gets on Shardz
					</p>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{universalFeatures.map((feature) => {
							const Icon = feature.icon;
							return (
								<div
									key={feature.title}
									className="rounded-2xl border border-brand-yellow/10 bg-brand-yellow/[0.03] p-6 text-center transition-colors hover:border-brand-yellow/20"
								>
									<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-yellow/20 bg-brand-yellow/10">
										<Icon className="h-6 w-6 text-brand-yellow" />
									</div>
									<h3 className="text-base font-bold text-white">
										{feature.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-cinema-muted">
										{feature.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* 4. Shardz Studio Callout */}
			<StudioCallout />

			{/* 5. CTA */}
			<CTASection
				variant="creator"
				primaryCTA={{ label: "Apply Now", href: "/dashboard/apply" }}
				secondaryCTA={{ label: "Explore the Platform", href: "/browse" }}
				tagline="The platform that pays creators what they're worth."
			/>
		</main>
	);
}
