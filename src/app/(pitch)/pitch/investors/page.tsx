import type { Metadata } from "next";
import { HeroSection } from "@/components/pitch/hero-section";
import { FeatureSection } from "@/components/pitch/feature-section";
import { StatsSection } from "@/components/pitch/stats-section";
import { CTASection } from "@/components/pitch/cta-section";
import { AttributionDashboardLazy } from "@/components/showcase/attribution-dashboard-lazy";
import {
	Play,
	Layers,
	TrendingUp,
	Zap,
	ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
	title: "MicroShort for Investors | The Missing Monetization Layer",
	description:
		"Short-form video has no monetization layer. MicroShort is the marketplace where creators sell premium series directly to audiences.",
};

const marketStats = [
	{
		value: "4.5B+",
		label: "Short-form video viewers worldwide",
		description:
			"TikTok, Reels, and Shorts have trained a generation to watch vertical video. None offer per-series purchases.",
	},
	{
		value: "$250B+",
		label: "Creator economy market size",
		description:
			"Yet creators earn less than $0.01 per view from ad-based platforms. The economics are broken.",
	},
	{
		value: "0",
		label: "Platforms purpose-built for premium short-form series",
		description:
			"YouTube sells subscriptions. Netflix sells catalogs. Nobody sells individual short-form series. Until now.",
	},
];

const howItWorks = [
	{
		step: 1,
		title: "Creators upload short-form series",
		description: "1-3 minute episodes organized into seasons. Film, comedy, music, AI -- any genre.",
		icon: Play,
	},
	{
		step: 2,
		title: "Viewers watch 3 episodes free, then pay to unlock",
		description: "Free episodes hook the audience. One-tap purchase unlocks the full season.",
		icon: Layers,
	},
	{
		step: 3,
		title: "Creators keep 80% of every sale",
		description: "Direct-to-fan monetization. No ad dependency. No subscription pool dilution.",
		icon: TrendingUp,
	},
];

const investorFeatures = [
	{
		title: "Cinematic Player",
		description:
			"Vertical-first on mobile, theater mode on desktop. Built for the way people watch. Signed playback, DRM-ready, and optimized for every screen size.",
		composition: "player" as const,
	},
	{
		title: "Genre Discovery",
		description:
			"Browse by genre. Every series is one tap away. A focused catalog that surfaces quality over quantity.",
		composition: "browse" as const,
	},
	{
		title: "Instant Monetization",
		description:
			"Free episodes hook viewers. One-tap unlock converts them to paying fans. The conversion funnel is built into the product.",
		composition: "paywall" as const,
	},
	{
		title: "Creator Analytics",
		description:
			"Full-funnel visibility from first view to revenue. Creators see exactly how their audience discovers, watches, and pays.",
		composition: "dashboard" as const,
	},
];

const whyNow = [
	{
		title: "AI filmmaking has collapsed production costs",
		description:
			"Anyone can create cinematic short-form content. The supply side is exploding, but there's no marketplace for it.",
	},
	{
		title: "Short-form is the dominant consumption format",
		description:
			"TikTok, Reels, and Shorts trained billions of viewers to consume vertical video. The behavior is established.",
	},
	{
		title: "Creators need direct monetization",
		description:
			"Ad revenue is declining and unreliable. Creators with dedicated audiences want to sell directly to fans.",
	},
	{
		title: "No incumbent owns this niche",
		description:
			"YouTube sells subscriptions. Netflix sells catalogs. TikTok sells attention. Nobody sells per-series short-form content.",
	},
];

export default function InvestorPitchPage() {
	return (
		<main>
			{/* 1. Hero */}
			<HeroSection
				variant="investor"
				headline="Short-Form Video Has No Monetization Layer"
				subheadline="MicroShort is the marketplace that lets creators sell premium short-form series directly to audiences. No subscriptions. No ad-dependency. Just content worth paying for."
			/>

			{/* 2. Market Opportunity */}
			<StatsSection variant="investor" stats={marketStats} />

			{/* 3. How It Works */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						The Business Model
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Simple economics. Clear value exchange.
					</p>

					<div className="relative">
						{/* Connecting line */}
						<div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-brand-yellow/40 via-brand-yellow/20 to-transparent md:block" />

						<div className="space-y-12">
							{howItWorks.map((item) => {
								const Icon = item.icon;
								return (
									<div key={item.step} className="flex gap-6 md:gap-8">
										{/* Step number */}
										<div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brand-yellow/20 bg-brand-yellow/10">
											<Icon className="h-7 w-7 text-brand-yellow" />
										</div>

										{/* Content */}
										<div className="flex-1 pt-2">
											<div className="flex items-center gap-3">
												<span className="text-sm font-bold text-brand-yellow">
													Step {item.step}
												</span>
												{item.step < 3 && (
													<ArrowRight className="h-3 w-3 text-cinema-muted" />
												)}
											</div>
											<h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">
												{item.title}
											</h3>
											<p className="mt-2 max-w-lg text-base text-cinema-muted md:text-lg">
												{item.description}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			{/* 4. Platform Features with Remotion demos */}
			<FeatureSection variant="investor" features={investorFeatures} />

			{/* 5. Platform Intelligence */}
			<section className="bg-cinema-black px-6 py-16 md:py-24">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						Platform Intelligence
					</h2>
					<p className="mx-auto mb-4 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Track Every Viewer from First Touch to Revenue
					</p>
					<p className="mx-auto mb-12 max-w-2xl text-center text-lg text-cinema-muted">
						MicroShort gives creators and operators full visibility
						into how content performs and where audiences come from.
					</p>
					<AttributionDashboardLazy />
				</div>
			</section>

			{/* 6. Why Now */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						Market Timing
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Why now is the moment
					</p>

					<div className="grid gap-6 sm:grid-cols-2">
						{whyNow.map((item) => (
							<div
								key={item.title}
								className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:border-brand-yellow/10"
							>
								<div className="mb-3 inline-flex items-center rounded-full bg-brand-yellow/10 px-3 py-1">
									<Zap className="mr-1.5 h-3.5 w-3.5 text-brand-yellow" />
									<span className="text-xs font-bold text-brand-yellow">
										Timing
									</span>
								</div>
								<h3 className="text-lg font-bold text-white">
									{item.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-cinema-muted">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 7. CTA */}
			<CTASection
				variant="investor"
				primaryCTA={{ label: "Explore the Platform", href: "/browse" }}
				secondaryCTA={{
					label: "Get in Touch",
					href: "mailto:invest@microshort.com",
				}}
				tagline="The missing marketplace for short-form video."
			/>
		</main>
	);
}
