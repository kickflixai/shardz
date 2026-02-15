import type { Metadata } from "next";
import {
	Clapperboard,
	Cpu,
	Briefcase,
	Sparkles,
	LineChart,
	Network,
	Gem,
	ExternalLink,
} from "lucide-react";
import { HeroSection } from "@/components/pitch/hero-section";
import { CTASection } from "@/components/pitch/cta-section";

export const metadata: Metadata = {
	title:
		"MicroShort Advisory Board | Shape the Future of Short-Form Entertainment",
	description:
		"Join MicroShort's advisory board. We're seeking entertainment, technology, and business leaders to help build the definitive short-form video marketplace.",
};

/* -------------------------------------------------------------------------- */
/*  Advisory Domains Data                                                      */
/* -------------------------------------------------------------------------- */

const advisoryDomains = [
	{
		icon: Clapperboard,
		title: "Entertainment & Content Strategy",
		description:
			"Guide content curation, creator relations, genre strategy, and the viewer experience. Help us build the taste-making layer.",
		profiles: [
			"Entertainment executives",
			"Content curators",
			"Talent managers",
			"Film festival programmers",
		],
	},
	{
		icon: Cpu,
		title: "Technology & Product",
		description:
			"Shape the platform's technical roadmap -- from AI-powered discovery to creator tools to the viewing experience.",
		profiles: [
			"Product leaders from streaming/social platforms",
			"AI/ML experts",
			"Video technology specialists",
			"UX design directors",
		],
	},
	{
		icon: Briefcase,
		title: "Business & Growth",
		description:
			"Advise on go-to-market, creator acquisition, brand partnerships, and monetization strategy.",
		profiles: [
			"Startup operators",
			"Marketplace strategists",
			"Media business executives",
			"Growth leaders",
		],
	},
];

/* -------------------------------------------------------------------------- */
/*  Advisory Benefits Data                                                     */
/* -------------------------------------------------------------------------- */

const advisoryBenefits = [
	{
		icon: Sparkles,
		title: "Direct Strategic Input",
		description:
			"Shape product direction and strategic decisions at the highest level. Your experience informs what we build next.",
	},
	{
		icon: LineChart,
		title: "Equity Participation",
		description:
			"Advisory shares that align your success with the platform's growth. Build wealth as the marketplace scales.",
	},
	{
		icon: Gem,
		title: "Early Access & Insights",
		description:
			"First look at platform data, market insights, and emerging trends in short-form content consumption.",
	},
	{
		icon: Network,
		title: "Advisory Network",
		description:
			"Join a curated network of fellow advisors spanning entertainment, technology, and business leadership.",
	},
];

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function AdvisorPitchPage() {
	return (
		<main>
			{/* 1. Hero */}
			<HeroSection
				variant="advisor"
				headline="Help Shape the Future of Short-Form Entertainment"
				subheadline="MicroShort is building the marketplace that turns short-form video into a viable creative business. We're looking for advisors who see the transformation coming."
			/>

			{/* 2. The Opportunity */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-4xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
						The Opportunity
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold text-white md:text-4xl">
						A Convergence That Changes Everything
					</p>

					{/* Narrative flow with pull-quotes */}
					<div className="space-y-16">
						{/* The Convergence */}
						<div className="relative">
							<div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-amber-400/60 via-amber-400/20 to-transparent" />
							<div className="pl-8">
								<p className="text-lg leading-relaxed text-cinema-muted md:text-xl">
									Three forces are converging at once: AI-powered creation tools
									are democratizing video production. Short-form content has
									become the dominant consumption format. And yet, there is no
									premium monetization layer for creators working in this
									space.
								</p>
								<blockquote className="mt-6 border-l-2 border-amber-400/40 pl-6">
									<p className="text-2xl font-bold italic text-white md:text-3xl">
										&ldquo;The tools exist. The audience exists. The marketplace
										does not.&rdquo;
									</p>
								</blockquote>
							</div>
						</div>

						{/* The Timing */}
						<div className="relative">
							<div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-amber-400/40 via-amber-400/20 to-transparent" />
							<div className="pl-8">
								<p className="text-lg leading-relaxed text-cinema-muted md:text-xl">
									Short-form is the dominant format, but creators cannot
									monetize it beyond advertising revenue. They create on
									platforms that own the relationship with their audience. The
									window for a dedicated marketplace -- one that lets creators
									set prices, own their catalog, and build a direct business --
									is open right now.
								</p>
								<blockquote className="mt-6 border-l-2 border-amber-400/40 pl-6">
									<p className="text-2xl font-bold italic text-white md:text-3xl">
										&ldquo;The window is now. First-mover advantage in premium
										short-form is unclaimed.&rdquo;
									</p>
								</blockquote>
							</div>
						</div>

						{/* The Vision */}
						<div className="relative">
							<div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-amber-400/40 via-amber-400/20 to-transparent" />
							<div className="pl-8">
								<p className="text-lg leading-relaxed text-cinema-muted md:text-xl">
									MicroShort becomes the definitive platform where short-form
									series are discovered, purchased, and celebrated. A
									marketplace built for creators who want to be paid for their
									craft, and viewers who want to support the content they love.
								</p>
								<blockquote className="mt-6 border-l-2 border-amber-400/40 pl-6">
									<p className="text-2xl font-bold italic text-white md:text-3xl">
										&ldquo;Not another social platform. A marketplace where
										short-form has real value.&rdquo;
									</p>
								</blockquote>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 3. Where Advisors Make Impact */}
			<section className="bg-gradient-to-b from-cinema-black via-[rgba(218,165,32,0.02)] to-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
						Where Advisors Make Impact
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold text-white md:text-4xl">
						Three Domains, One Mission
					</p>
					<div className="grid gap-8 md:grid-cols-3">
						{advisoryDomains.map((domain) => (
							<div
								key={domain.title}
								className="group rounded-2xl border border-white/5 bg-white/[0.03] p-8 transition-colors hover:border-amber-500/30 hover:bg-white/[0.05]"
							>
								<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
									<domain.icon className="h-6 w-6 text-amber-400" />
								</div>
								<h3 className="mb-3 text-xl font-bold text-white">
									{domain.title}
								</h3>
								<p className="mb-6 leading-relaxed text-cinema-muted">
									{domain.description}
								</p>
								<div>
									<p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-400/70">
										Ideal Profile
									</p>
									<ul className="space-y-2">
										{domain.profiles.map((profile) => (
											<li
												key={profile}
												className="flex items-start gap-2 text-sm text-cinema-muted"
											>
												<span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/50" />
												{profile}
											</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 4. What We Offer */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
						What We Offer
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold text-white md:text-4xl">
						Advisory Board Benefits
					</p>
					<div className="grid gap-6 sm:grid-cols-2">
						{advisoryBenefits.map((benefit) => (
							<div
								key={benefit.title}
								className="rounded-2xl border border-amber-500/10 bg-gradient-to-br from-amber-500/[0.04] to-transparent p-8"
							>
								<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
									<benefit.icon className="h-5 w-5 text-amber-400" />
								</div>
								<h3 className="mb-2 text-lg font-bold text-white">
									{benefit.title}
								</h3>
								<p className="leading-relaxed text-cinema-muted">
									{benefit.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 5. The Platform Today */}
			<section className="bg-gradient-to-b from-cinema-black via-[rgba(218,165,32,0.02)] to-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-3xl text-center">
					<h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
						The Platform Today
					</h2>
					<p className="mb-8 text-3xl font-bold text-white md:text-4xl">
						Not a Pitch Deck. A Working Product.
					</p>
					<p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-cinema-muted">
						MicroShort is a functional marketplace with genre discovery, video
						playback, payments, and a creator dashboard. Ready for its first
						wave of content and creators.
					</p>

					<div className="mx-auto mb-10 grid max-w-lg gap-4 sm:grid-cols-2">
						{[
							"Genre-based discovery",
							"Secure video playback",
							"Stripe-powered payments",
							"Creator dashboard",
							"Admin moderation",
							"Content management",
						].map((feature) => (
							<div
								key={feature}
								className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm text-cinema-muted"
							>
								<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
								{feature}
							</div>
						))}
					</div>

					<a
						href="/browse"
						className="inline-flex items-center gap-2 text-amber-400 transition-colors hover:text-amber-300"
					>
						<span className="font-semibold">See it for yourself</span>
						<ExternalLink className="h-4 w-4" />
					</a>
				</div>
			</section>

			{/* 6. CTA */}
			<CTASection
				variant="advisor"
				tagline="The best platforms are shaped by the people who see what's next."
				primaryCTA={{ label: "Explore the Platform", href: "/browse" }}
				secondaryCTA={{
					label: "Join Our Advisory Board",
					href: "mailto:advisors@microshort.com",
				}}
			/>
		</main>
	);
}
