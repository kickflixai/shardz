import type { Metadata } from "next";
import Image from "next/image";
import { HeroSection } from "@/components/pitch/hero-section";
import { FeatureSection } from "@/components/pitch/feature-section";
import { StatsSection } from "@/components/pitch/stats-section";
import { CTASection } from "@/components/pitch/cta-section";
import { StudioCallout } from "@/components/pitch/studio-callout";
import {
	Upload,
	FolderOpen,
	Tag,
	Banknote,
	Search,
	PlayCircle,
	Heart,
	Unlock,
	Monitor,
	Shield,
	Database,
	Zap,
	Brain,
	BarChart3,
	Video,
	Users,
	Megaphone,
	ArrowRight,
	Check,
	X,
} from "lucide-react";

export const metadata: Metadata = {
	title: "Shardz | The Definitive Short-Form Video Marketplace",
	description:
		"Shardz is where premium short-form series are discovered, purchased, and celebrated. A complete marketplace built for creators, viewers, and brands.",
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const marketStats = [
	{
		value: "5.2B+",
		label: "Short-form viewers worldwide",
		description:
			"TikTok, Reels, and Shorts have trained an entire generation to consume vertical video. The audience already exists.",
	},
	{
		value: "$500B+",
		label: "Creator economy market size",
		description:
			"The creator economy is exploding, yet most creators earn pennies. Shardz captures the monetization gap.",
	},
	{
		value: "82%",
		label: "Of internet traffic is video",
		description:
			"Video dominates the internet. Short-form is the fastest-growing segment. Premium content needs a home.",
	},
	{
		value: "0",
		label: "Platforms for premium per-series short-form",
		description:
			"YouTube sells subscriptions. Netflix sells catalogs. TikTok sells attention. Nobody sells individual short-form series. Until now.",
	},
];

const creatorSteps = [
	{
		step: 1,
		title: "Upload",
		description: "Drag and drop your 1-3 minute episodes. Mux handles encoding, DRM, and adaptive streaming automatically.",
		icon: Upload,
	},
	{
		step: 2,
		title: "Organize",
		description: "Group episodes into seasons and series. Tag with genres, add descriptions, and set cover art.",
		icon: FolderOpen,
	},
	{
		step: 3,
		title: "Price",
		description: "Set per-season pricing from $0.99 to $9.99. First 3 episodes are always free to hook viewers.",
		icon: Tag,
	},
	{
		step: 4,
		title: "Earn",
		description: "Keep 80% of every sale. Payouts via Stripe Connect -- transparent, automatic, reliable.",
		icon: Banknote,
	},
];

const viewerSteps = [
	{
		step: 1,
		title: "Browse",
		description: "Discover series across 11 genres. Curated collections, trending series, and personalized recommendations.",
		icon: Search,
	},
	{
		step: 2,
		title: "Watch Free",
		description: "Every season starts with 3 free episodes. Sample the story, meet the characters, feel the vibe.",
		icon: PlayCircle,
	},
	{
		step: 3,
		title: "Get Hooked",
		description: "Great storytelling creates demand. By episode 3, viewers are invested in the narrative.",
		icon: Heart,
	},
	{
		step: 4,
		title: "Unlock",
		description: "One-tap purchase unlocks the full season. No subscriptions, no commitments -- just content worth paying for.",
		icon: Unlock,
	},
];

const platformFeatures = [
	{
		title: "Cinematic Player",
		description:
			"Vertical-first on mobile, theater mode on desktop. Signed playback URLs, DRM-ready, and optimized for every screen size. Built for the way people actually watch.",
		composition: "player" as const,
	},
	{
		title: "Genre Discovery",
		description:
			"Browse by genre across 11 categories. Every series is one tap away. A focused catalog that surfaces quality over quantity, not algorithm-driven infinite scroll.",
		composition: "browse" as const,
	},
	{
		title: "Instant Monetization",
		description:
			"Free episodes hook viewers. One-tap unlock converts them to paying fans. The conversion funnel is built into the product -- creators just make great content.",
		composition: "paywall" as const,
	},
	{
		title: "Creator Analytics",
		description:
			"Full-funnel visibility from first view to revenue. Creators see exactly how their audience discovers, watches, and pays. Data-driven growth, not guesswork.",
		composition: "dashboard" as const,
	},
	{
		title: "Social Engagement Layer",
		description:
			"Real-time emoji reactions and timestamped comments. Viewers participate, not just watch. Every reaction is a data point that helps creators understand their audience.",
		composition: "social" as const,
	},
	{
		title: "AI Creation Suite & Shardz Studio",
		description:
			"Integrated AI tools plus free training for every creator. The next wave of filmmakers won't need Hollywood budgets — they'll need Shardz.",
		composition: "ai-tools" as const,
	},
	{
		title: "Multi-Format Monetization",
		description:
			"Scripted series, BTS, tutorials, music videos, AI cinema — every format earns. One platform, every content type, real revenue.",
		composition: "formats" as const,
	},
];

const revenueExamples = [
	{ fans: "1K", total: "$3,992", perSale: "$4.99", label: "Early Traction" },
	{ fans: "10K", total: "$39,920", perSale: "$4.99", label: "Growth Phase" },
	{ fans: "100K", total: "$399,200", perSale: "$4.99", label: "At Scale" },
];

const platformComparison = [
	{
		platform: "YouTube",
		model: "Ad revenue share",
		perView: "$0.003",
		creatorCut: "~55%",
		ownership: "Algorithm-dependent",
		highlight: false,
	},
	{
		platform: "Patreon",
		model: "Monthly subscription",
		perView: "$1-5/mo",
		creatorCut: "88-95%",
		ownership: "Subscription fatigue",
		highlight: false,
	},
	{
		platform: "Shardz",
		model: "Per-series purchase",
		perView: "$0.99-9.99",
		creatorCut: "80%",
		ownership: "Direct ownership",
		highlight: true,
	},
];

const audienceColumns = [
	{
		icon: Video,
		title: "For Creators",
		accent: "text-brand-yellow",
		accentBg: "bg-brand-yellow/10",
		accentBorder: "border-brand-yellow/20",
		bullets: [
			"Keep 80% of every sale via Stripe Connect",
			"Self-serve upload with Mux encoding",
			"Set your own per-season pricing ($0.99-$9.99)",
			"Full-funnel analytics: views, conversions, revenue",
		],
	},
	{
		icon: Users,
		title: "For Viewers",
		accent: "text-brand-yellow",
		accentBg: "bg-brand-yellow/10",
		accentBorder: "border-brand-yellow/20",
		bullets: [
			"Browse 11 genre categories of curated content",
			"Watch 3 free episodes before you pay anything",
			"One-tap purchase -- no subscriptions required",
			"Cinematic player: vertical mobile, theater desktop",
		],
	},
	{
		icon: Megaphone,
		title: "For Brands",
		accent: "text-brand-yellow",
		accentBg: "bg-brand-yellow/10",
		accentBorder: "border-brand-yellow/20",
		bullets: [
			"Genre-targeted advertising to engaged audiences",
			"Sponsored series and branded content partnerships",
			"Pre-roll ad spots on free episodes",
			"Unified campaign analytics and brand-safe environment",
		],
	},
];

const techStack = [
	{
		icon: Monitor,
		title: "Mux Video",
		description: "Adaptive streaming, signed URLs, DRM protection, and sub-second encoding for every upload.",
	},
	{
		icon: Shield,
		title: "Stripe Payments",
		description: "Per-season purchases, Stripe Connect payouts, and PCI-compliant transactions worldwide.",
	},
	{
		icon: Database,
		title: "Supabase Auth & Data",
		description: "Row-level security, real-time subscriptions, and instant auth with social providers.",
	},
	{
		icon: Zap,
		title: "Next.js Performance",
		description: "Server-side rendering, edge caching, and sub-second page loads on every device.",
	},
	{
		icon: Brain,
		title: "AI-Powered Discovery",
		description: "Smart recommendations, genre affinity modeling, and personalized content surfacing.",
	},
	{
		icon: BarChart3,
		title: "Full-Funnel Analytics",
		description: "Attribution tracking from first touch to revenue. UTM, referral, and conversion analytics.",
	},
];

const platformThumbnails = [
	{ src: "/thumbnails/mock-orbital-breach.png", title: "ORBITAL BREACH" },
	{ src: "/thumbnails/mock-chrome-pursuit.png", title: "Chrome Pursuit" },
	{ src: "/thumbnails/mock-the-last-summoner.png", title: "The Last Summoner" },
	{ src: "/thumbnails/mock-titan-fall.png", title: "TITAN FALL" },
	{ src: "/thumbnails/mock-sandstorm-kings.png", title: "Sandstorm Kings" },
	{ src: "/thumbnails/mock-ashborn.png", title: "Ashborn" },
];

const launchMetrics: Array<{ value: string; label: string; small?: boolean }> = [
	{ value: "20+", label: "Series at Launch" },
	{ value: "11", label: "Genre Categories" },
	{ value: "160+", label: "Episodes" },
	{ value: "$0.99–$9.99", label: "Pricing Range", small: true },
	{ value: "80%", label: "Creator Revenue Share" },
	{ value: "3", label: "Free Episodes per Season" },
];

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function PlatformOverviewPage() {
	return (
		<main>
			{/* ---------------------------------------------------------------- */}
			{/*  1. Hero                                                          */}
			{/* ---------------------------------------------------------------- */}
			<HeroSection
				variant="investor"
				badge="Platform Overview"
				headline="The Definitive Short-Form Video Marketplace"
				subheadline="Shardz is where premium short-form series are discovered, purchased, and celebrated. A complete marketplace built for creators, viewers, and brands."
				backgroundImage="/pitch/hero-platform.jpg"
			/>

			{/* ---------------------------------------------------------------- */}
			{/*  2. Market Opportunity Stats                                       */}
			{/* ---------------------------------------------------------------- */}
			<StatsSection variant="investor" stats={marketStats} />

			{/* ---------------------------------------------------------------- */}
			{/*  3. The Problem & Solution                                         */}
			{/* ---------------------------------------------------------------- */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						The Problem & Solution
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						The creator economy is broken. We&apos;re fixing it.
					</p>

					<div className="grid gap-8 md:grid-cols-2">
						{/* Problem */}
						<div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-8 md:p-10">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5">
								<X className="h-4 w-4 text-red-400" />
								<span className="text-sm font-bold text-red-400">
									The Status Quo
								</span>
							</div>
							<div className="space-y-5">
								<div>
									<p className="text-3xl font-extrabold text-red-400/80">
										$0.003
									</p>
									<p className="mt-1 text-sm text-cinema-muted">
										Average creator earnings per view on ad-based platforms
									</p>
								</div>
								<div>
									<p className="text-3xl font-extrabold text-red-400/80">
										97%
									</p>
									<p className="mt-1 text-sm text-cinema-muted">
										Of creators make less than $1,000 per year
									</p>
								</div>
								<div className="border-t border-red-500/10 pt-5">
									<p className="text-base leading-relaxed text-cinema-muted">
										Audiences scroll endlessly through algorithm-driven feeds.
										Creators compete for scraps of ad revenue. Quality content
										is buried under viral noise. There is no marketplace for
										premium short-form video.
									</p>
								</div>
							</div>
						</div>

						{/* Solution */}
						<div className="rounded-2xl border border-brand-yellow/20 bg-brand-yellow/[0.03] p-8 md:p-10">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-yellow/10 px-4 py-1.5">
								<Check className="h-4 w-4 text-brand-yellow" />
								<span className="text-sm font-bold text-brand-yellow">
									The Shardz Way
								</span>
							</div>
							<div className="space-y-5">
								<div>
									<p className="text-3xl font-extrabold text-brand-yellow">
										80/20
									</p>
									<p className="mt-1 text-sm text-cinema-muted">
										Creators keep 80% of every sale. Direct monetization.
									</p>
								</div>
								<div>
									<p className="text-3xl font-extrabold text-brand-yellow">
										Per-Series
									</p>
									<p className="mt-1 text-sm text-cinema-muted">
										Viewers discover by genre and pay for what they love
									</p>
								</div>
								<div className="border-t border-brand-yellow/10 pt-5">
									<p className="text-base leading-relaxed text-cinema-muted">
										Shardz gives creators direct monetization with no ad
										dependency and no subscription dilution. Viewers browse by
										genre, watch 3 free episodes, and unlock full seasons with
										a single tap. Quality rises to the top.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- */}
			{/*  4. How It Works                                                   */}
			{/* ---------------------------------------------------------------- */}
			<section className="bg-gradient-to-b from-cinema-black via-[rgba(224,184,0,0.02)] to-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						How It Works
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Two journeys. One marketplace.
					</p>

					<div className="grid gap-12 lg:gap-16 lg:grid-cols-2">
						{/* Creator Flow */}
						<div>
							<div className="mb-8 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow/10">
									<Video className="h-5 w-5 text-brand-yellow" />
								</div>
								<h3 className="text-xl font-bold text-white">
									The Creator Journey
								</h3>
							</div>

							<div className="space-y-6">
								{creatorSteps.map((item, i) => {
									const Icon = item.icon;
									return (
										<div key={item.step} className="flex gap-4">
											<div className="flex flex-col items-center">
												<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-yellow/20 bg-brand-yellow/10">
													<Icon className="h-5 w-5 text-brand-yellow" />
												</div>
												{i < creatorSteps.length - 1 && (
													<div className="mt-2 h-full w-px bg-brand-yellow/10" />
												)}
											</div>
											<div className="pb-6">
												<div className="flex items-center gap-2">
													<span className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
														Step {item.step}
													</span>
													<span className="text-lg font-bold text-white">
														{item.title}
													</span>
												</div>
												<p className="mt-1 text-sm leading-relaxed text-cinema-muted">
													{item.description}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Viewer Flow */}
						<div>
							<div className="mb-8 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow/10">
									<Users className="h-5 w-5 text-brand-yellow" />
								</div>
								<h3 className="text-xl font-bold text-white">
									The Viewer Journey
								</h3>
							</div>

							<div className="space-y-6">
								{viewerSteps.map((item, i) => {
									const Icon = item.icon;
									return (
										<div key={item.step} className="flex gap-4">
											<div className="flex flex-col items-center">
												<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-yellow/20 bg-brand-yellow/10">
													<Icon className="h-5 w-5 text-brand-yellow" />
												</div>
												{i < viewerSteps.length - 1 && (
													<div className="mt-2 h-full w-px bg-brand-yellow/10" />
												)}
											</div>
											<div className="pb-6">
												<div className="flex items-center gap-2">
													<span className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
														Step {item.step}
													</span>
													<span className="text-lg font-bold text-white">
														{item.title}
													</span>
												</div>
												<p className="mt-1 text-sm leading-relaxed text-cinema-muted">
													{item.description}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- */}
			{/*  5. Platform Features (Remotion Animated Demos)                     */}
			{/* ---------------------------------------------------------------- */}
			<FeatureSection variant="investor" features={platformFeatures} />

			{/* ---------------------------------------------------------------- */}
			{/*  6. The Economics                                                   */}
			{/* ---------------------------------------------------------------- */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						The Economics
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						A revenue model that works for everyone
					</p>

					{/* Revenue Split */}
					<div className="mx-auto mb-16 max-w-3xl">
						<div className="overflow-hidden rounded-2xl border border-white/5">
							<div className="flex items-center justify-between bg-brand-yellow/10 px-8 py-8 md:px-12">
								<div>
									<div className="text-5xl font-extrabold text-brand-yellow md:text-7xl">
										80%
									</div>
									<div className="mt-2 text-lg font-bold text-white">
										Creator Revenue
									</div>
									<div className="mt-1 text-sm text-cinema-muted">
										Direct to creator via Stripe Connect
									</div>
								</div>
								<div className="hidden text-right sm:block">
									<div className="text-sm font-medium text-cinema-muted">
										Pricing range
									</div>
									<div className="mt-1 text-2xl font-extrabold text-brand-yellow">
										$0.99 - $9.99
									</div>
									<div className="mt-1 text-sm text-cinema-muted">
										per season, set by creator
									</div>
								</div>
							</div>
							<div className="flex items-center justify-between border-t border-white/5 bg-white/[0.03] px-8 py-5 md:px-12">
								<div>
									<div className="text-2xl font-bold text-cinema-muted">
										20%
									</div>
									<div className="mt-0.5 text-sm text-cinema-muted">
										Platform
									</div>
								</div>
								<div className="text-right text-sm text-cinema-muted">
									Hosting, payments, discovery, infrastructure
								</div>
							</div>
						</div>
					</div>

					{/* Revenue at Scale */}
					<div className="mb-16">
						<h3 className="mb-8 text-center text-xl font-bold text-white">
							Creator Revenue at Scale
						</h3>
						<div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
							{revenueExamples.map((ex) => (
								<div
									key={ex.fans}
									className="rounded-2xl border border-brand-yellow/10 bg-brand-yellow/[0.03] p-8 text-center transition-colors hover:border-brand-yellow/20"
								>
									<div className="mb-1 text-xs font-bold uppercase tracking-wider text-cinema-muted">
										{ex.label}
									</div>
									<div className="mb-3 text-4xl font-extrabold text-brand-yellow md:text-5xl">
										{ex.total}
									</div>
									<div className="text-sm text-cinema-muted">
										{ex.fans} fans x {ex.perSale}/season
									</div>
									<div className="mt-1 text-xs text-cinema-muted/60">
										80% of every sale in your pocket
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Platform Comparison */}
					<div>
						<h3 className="mb-8 text-center text-xl font-bold text-white">
							How Shardz Compares
						</h3>
						<div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/5">
							{/* Table Header */}
							<div className="hidden grid-cols-5 gap-px bg-white/5 sm:grid">
								<div className="bg-cinema-black p-4 text-sm font-bold text-cinema-muted">
									Platform
								</div>
								<div className="bg-cinema-black p-4 text-sm font-bold text-cinema-muted">
									Model
								</div>
								<div className="bg-cinema-black p-4 text-sm font-bold text-cinema-muted">
									Price Point
								</div>
								<div className="bg-cinema-black p-4 text-sm font-bold text-cinema-muted">
									Creator Cut
								</div>
								<div className="bg-cinema-black p-4 text-sm font-bold text-cinema-muted">
									Ownership
								</div>
							</div>
							{/* Table Rows */}
							{platformComparison.map((row) => (
								<div
									key={row.platform}
									className={`grid grid-cols-2 gap-px sm:grid-cols-5 ${
										row.highlight
											? "bg-brand-yellow/5"
											: "bg-white/[0.02]"
									}`}
								>
									<div
										className={`p-4 text-sm font-bold ${
											row.highlight ? "text-brand-yellow" : "text-white"
										}`}
									>
										{row.platform}
										{row.highlight && (
											<span className="ml-2 inline-flex items-center rounded-full bg-brand-yellow/10 px-2 py-0.5 text-[10px] font-bold text-brand-yellow sm:hidden">
												This is us
											</span>
										)}
									</div>
									<div className="p-4 text-sm text-cinema-muted">
										{row.model}
									</div>
									<div className="p-4 text-sm text-cinema-muted">
										{row.perView}
									</div>
									<div
										className={`p-4 text-sm font-semibold ${
											row.highlight ? "text-brand-yellow" : "text-cinema-muted"
										}`}
									>
										{row.creatorCut}
									</div>
									<div className="p-4 text-sm text-cinema-muted">
										{row.ownership}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- */}
			{/*  7. For Everyone                                                   */}
			{/* ---------------------------------------------------------------- */}
			<section className="bg-gradient-to-b from-cinema-black via-[rgba(224,184,0,0.02)] to-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						For Everyone
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						One platform. Three audiences. Infinite potential.
					</p>

					<div className="grid gap-8 md:grid-cols-3">
						{audienceColumns.map((col) => {
							const Icon = col.icon;
							return (
								<div
									key={col.title}
									className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:border-brand-yellow/10"
								>
									<div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${col.accentBg}`}>
										<Icon className={`h-7 w-7 ${col.accent}`} />
									</div>
									<h3 className="mb-4 text-xl font-bold text-white">
										{col.title}
									</h3>
									<ul className="space-y-3">
										{col.bullets.map((bullet) => (
											<li
												key={bullet}
												className="flex items-start gap-2.5 text-sm leading-relaxed text-cinema-muted"
											>
												<ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-yellow" />
												{bullet}
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- */}
			{/*  8. Technology & Trust                                              */}
			{/* ---------------------------------------------------------------- */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						Technology &amp; Trust
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Built on infrastructure that scales
					</p>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{techStack.map((tech) => {
							const Icon = tech.icon;
							return (
								<div
									key={tech.title}
									className="group rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:border-brand-yellow/10"
								>
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow/10 transition-colors group-hover:bg-brand-yellow/20">
										<Icon className="h-6 w-6 text-brand-yellow" />
									</div>
									<h3 className="mb-2 text-lg font-bold text-white">
										{tech.title}
									</h3>
									<p className="text-sm leading-relaxed text-cinema-muted">
										{tech.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- */}
			{/*  9. Platform Preview                                               */}
			{/* ---------------------------------------------------------------- */}
			<section className="bg-gradient-to-b from-cinema-black via-[rgba(224,184,0,0.02)] to-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl text-center">
					<h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						Platform Preview
					</h2>
					<p className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Not a Pitch Deck. A Working Product.
					</p>
					<p className="mx-auto mb-12 max-w-xl text-lg text-cinema-muted">
						Shardz is a fully functional marketplace with genre discovery,
						cinematic playback, payments, and creator tools -- live today.
					</p>

					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
						{platformThumbnails.map((t) => (
							<div
								key={t.title}
								className="group overflow-hidden rounded-xl border border-white/5 transition-colors hover:border-brand-yellow/20"
							>
								<div className="relative aspect-[3/4]">
									<Image
										src={t.src}
										alt={t.title}
										fill
										className="object-cover transition-transform group-hover:scale-105"
									/>
								</div>
								<div className="bg-white/[0.03] px-3 py-2">
									<p className="text-sm font-medium text-white">
										{t.title}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- */}
			{/*  10. By The Numbers                                                */}
			{/* ---------------------------------------------------------------- */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						By The Numbers
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						The platform at a glance
					</p>

					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
						{launchMetrics.map((metric) => (
							<div
								key={metric.label}
								className="rounded-2xl border border-white/5 bg-white/5 p-6 text-center backdrop-blur-sm"
							>
								<div className={`font-extrabold text-brand-yellow ${metric.small ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"}`}>
									{metric.value}
								</div>
								<div className="mt-2 text-xs font-semibold text-cinema-muted">
									{metric.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- */}
			{/*  11. Creator Education                                              */}
			{/* ---------------------------------------------------------------- */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl">
					<StudioCallout variant="compact" />
				</div>
			</section>

			{/* ---------------------------------------------------------------- */}
			{/*  12. CTA                                                           */}
			{/* ---------------------------------------------------------------- */}
			<CTASection
				variant="investor"
				primaryCTA={{ label: "Explore the Platform", href: "/browse" }}
				secondaryCTA={{
					label: "Get in Touch",
					href: "mailto:hello@shardz.tv",
				}}
				tagline="Experience the Future of Short-Form."
			/>
		</main>
	);
}
