import type { Metadata } from "next";
import {
	Target,
	Eye,
	ShieldCheck,
	Film,
	Play,
	Handshake,
	BarChart3,
	Users,
	TrendingUp,
	Rocket,
	Crown,
	Star,
} from "lucide-react";
import { HeroSection } from "@/components/pitch/hero-section";
import { CTASection } from "@/components/pitch/cta-section";

export const metadata: Metadata = {
	title: "MicroShort for Brands | Genre-Targeted Short-Form Advertising",
	description:
		"Reach paying, engaged audiences through genre-targeted advertising on MicroShort. Sponsored series, pre-roll spots, and branded content partnerships.",
};

/* -------------------------------------------------------------------------- */
/*  Ad Products Data                                                          */
/* -------------------------------------------------------------------------- */

const adProducts = [
	{
		icon: Film,
		title: "Sponsored Series",
		description:
			"Fund original series with your brand woven into the narrative. Native storytelling, not interruptive ads.",
		visual: {
			label: "SPONSORED BY",
			brand: "ACME Co.",
			series: "Signal Lost",
			genre: "Sci-Fi",
		},
	},
	{
		icon: Play,
		title: "Pre-Roll Ad Spots",
		description:
			"15-second pre-roll before free episodes. Reach viewers before they're hooked.",
		visual: {
			countdown: "Ad plays in 0:15",
			episode: "Episode 1: Awakening",
		},
	},
	{
		icon: Handshake,
		title: "Branded Content Partnerships",
		description:
			"Co-create content with top creators. Authentic brand storytelling for the short-form era.",
		visual: {
			creator: "Maya Chen",
			brand: "Your Brand",
			collab: "Co-Produced Series",
		},
	},
];

/* -------------------------------------------------------------------------- */
/*  Differentiators Data                                                       */
/* -------------------------------------------------------------------------- */

const differentiators = [
	{
		icon: Target,
		title: "Genre-Targeted Precision",
		description:
			"Place your brand alongside specific genres -- reach sci-fi enthusiasts, comedy fans, or documentary viewers with surgical precision.",
	},
	{
		icon: Eye,
		title: "Premium Attention",
		description:
			"Viewers on MicroShort are paying customers, not passive scrollers. Higher intent, higher engagement, higher recall.",
	},
	{
		icon: ShieldCheck,
		title: "Brand-Safe Environment",
		description:
			"Curated creator marketplace with whitelisted creators. Your brand appears alongside quality content, every time.",
	},
];

/* -------------------------------------------------------------------------- */
/*  Audience Insights Data                                                     */
/* -------------------------------------------------------------------------- */

const audienceInsights = [
	{
		icon: BarChart3,
		title: "Genre Preference Distribution",
		description:
			"Sci-fi, thriller, and drama lead in engagement. Reach the most invested audiences in the genres that align with your brand.",
		metrics: [
			{ genre: "Sci-Fi", width: "85%" },
			{ genre: "Thriller", width: "78%" },
			{ genre: "Drama", width: "72%" },
			{ genre: "Comedy", width: "65%" },
			{ genre: "Action", width: "58%" },
		],
	},
	{
		icon: Users,
		title: "Demographic Reach",
		description:
			"Short-form skews 18-34, but premium paid content broadens the demographic to include high-value 25-44 decision-makers.",
		stats: [
			{ label: "18-24", value: "32%" },
			{ label: "25-34", value: "38%" },
			{ label: "35-44", value: "21%" },
			{ label: "45+", value: "9%" },
		],
	},
	{
		icon: TrendingUp,
		title: "Engagement Advantage",
		description:
			"Paying viewers watch 3.2x more content and recall brand placements at 4x the rate of free social media viewers.",
		comparison: [
			{ label: "Avg. Watch Time", paid: "12 min", free: "3.8 min" },
			{ label: "Brand Recall", paid: "68%", free: "17%" },
			{ label: "Click-Through", paid: "4.2%", free: "0.8%" },
		],
	},
];

/* -------------------------------------------------------------------------- */
/*  Partnership Tiers Data                                                     */
/* -------------------------------------------------------------------------- */

const partnershipTiers = [
	{
		icon: Rocket,
		name: "Launch Partner",
		highlight: false,
		benefits: [
			"First-mover advantage in your category",
			"Category exclusivity during launch period",
			"Co-marketing support and PR visibility",
			"Direct access to platform analytics",
		],
	},
	{
		icon: Crown,
		name: "Genre Sponsor",
		highlight: true,
		benefits: [
			"Own a genre category page",
			"Branded genre landing experience",
			"Featured placement across all genre content",
			"Custom audience reports by genre",
		],
	},
	{
		icon: Star,
		name: "Series Sponsor",
		highlight: false,
		benefits: [
			"Fund specific series productions",
			"Native brand integration in episodes",
			"Creator collaboration and co-creation",
			"Exclusive behind-the-scenes content",
		],
	},
];

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function BrandPitchPage() {
	return (
		<main>
			{/* 1. Hero */}
			<HeroSection
				variant="brand"
				headline="Reach Audiences by What They Love to Watch"
				subheadline="MicroShort's genre-targeted marketplace puts your brand in front of engaged viewers who chose to pay for content they care about. Premium attention, not passive scrolling."
			/>

			{/* 2. Why MicroShort for Brands */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-teal-400">
						Why MicroShort
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold text-white md:text-4xl">
						Advertising That Audiences Actually Choose
					</p>
					<div className="grid gap-8 md:grid-cols-3">
						{differentiators.map((item) => (
							<div
								key={item.title}
								className="group rounded-2xl border border-white/5 bg-white/[0.03] p-8 transition-colors hover:border-teal-500/30 hover:bg-white/[0.05]"
							>
								<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10">
									<item.icon className="h-6 w-6 text-teal-400" />
								</div>
								<h3 className="mb-3 text-xl font-bold text-white">
									{item.title}
								</h3>
								<p className="leading-relaxed text-cinema-muted">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 3. Ad Products */}
			<section className="bg-gradient-to-b from-cinema-black via-[rgba(0,200,200,0.02)] to-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-teal-400">
						Ad Products
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold text-white md:text-4xl">
						Three Ways to Connect With Viewers
					</p>
					<div className="space-y-12">
						{adProducts.map((product, i) => (
							<div
								key={product.title}
								className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
							>
								{/* Text */}
								<div className="flex-1">
									<div className="mb-4 flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
											<product.icon className="h-5 w-5 text-teal-400" />
										</div>
										<h3 className="text-2xl font-bold text-white">
											{product.title}
										</h3>
									</div>
									<p className="text-lg leading-relaxed text-cinema-muted">
										{product.description}
									</p>
								</div>

								{/* Visual Mock */}
								<div className="flex-1">
									<AdProductVisual product={product} />
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 4. Audience Insights */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-teal-400">
						Audience Insights
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold text-white md:text-4xl">
						Understand Who Is Watching
					</p>
					<div className="grid gap-8 lg:grid-cols-3">
						{audienceInsights.map((insight) => (
							<div
								key={insight.title}
								className="rounded-2xl border border-white/5 bg-white/[0.03] p-8"
							>
								<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10">
									<insight.icon className="h-6 w-6 text-teal-400" />
								</div>
								<h3 className="mb-2 text-lg font-bold text-white">
									{insight.title}
								</h3>
								<p className="mb-6 text-sm leading-relaxed text-cinema-muted">
									{insight.description}
								</p>
								<AudienceInsightVisual insight={insight} />
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 5. Partnership Tiers */}
			<section className="bg-gradient-to-b from-cinema-black via-[rgba(0,200,200,0.02)] to-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-teal-400">
						Partnership Tiers
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold text-white md:text-4xl">
						Choose Your Level of Engagement
					</p>
					<div className="grid gap-8 md:grid-cols-3">
						{partnershipTiers.map((tier) => (
							<div
								key={tier.name}
								className={`relative rounded-2xl border p-8 transition-colors ${
									tier.highlight
										? "border-teal-500/40 bg-teal-500/[0.05]"
										: "border-white/5 bg-white/[0.03] hover:border-teal-500/20"
								}`}
							>
								{tier.highlight && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-cinema-black">
										Most Popular
									</div>
								)}
								<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10">
									<tier.icon className="h-6 w-6 text-teal-400" />
								</div>
								<h3 className="mb-4 text-xl font-bold text-white">
									{tier.name}
								</h3>
								<ul className="space-y-3">
									{tier.benefits.map((benefit) => (
										<li
											key={benefit}
											className="flex items-start gap-2 text-sm text-cinema-muted"
										>
											<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
											{benefit}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 6. CTA */}
			<CTASection
				variant="brand"
				tagline="Where brands meet audiences who are ready to engage."
				primaryCTA={{ label: "Explore the Platform", href: "/browse" }}
				secondaryCTA={{
					label: "Partner With Us",
					href: "mailto:brands@microshort.com",
				}}
			/>
		</main>
	);
}

/* -------------------------------------------------------------------------- */
/*  Ad Product Visual Mocks                                                    */
/* -------------------------------------------------------------------------- */

function AdProductVisual({
	product,
}: {
	product: (typeof adProducts)[number];
}) {
	if ("brand" in product.visual) {
		// Sponsored Series mock
		return (
			<div className="overflow-hidden rounded-xl border border-white/10 bg-cinema-dark">
				<div className="relative aspect-video bg-gradient-to-br from-teal-900/30 to-cinema-dark">
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<div className="mb-2 rounded bg-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-300">
							{product.visual.label}
						</div>
						<p className="text-lg font-bold text-white">
							{product.visual.brand}
						</p>
					</div>
				</div>
				<div className="border-t border-white/5 p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-semibold text-white">
								{product.visual.series}
							</p>
							<p className="text-xs text-cinema-muted">
								{product.visual.genre}
							</p>
						</div>
						<div className="rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-400">
							Sponsored
						</div>
					</div>
				</div>
			</div>
		);
	}

	if ("countdown" in product.visual) {
		// Pre-Roll mock
		return (
			<div className="overflow-hidden rounded-xl border border-white/10 bg-cinema-dark">
				<div className="relative aspect-video bg-gradient-to-br from-cinema-dark to-teal-900/20">
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex flex-col items-center gap-3">
							<div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-teal-400/50 bg-teal-500/10">
								<Play className="h-8 w-8 text-teal-400" />
							</div>
							<p className="text-sm font-medium text-teal-300">
								{product.visual.countdown}
							</p>
						</div>
					</div>
					{/* Progress bar */}
					<div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
						<div className="h-full w-1/3 bg-teal-400" />
					</div>
				</div>
				<div className="border-t border-white/5 p-4">
					<p className="text-sm text-cinema-muted">
						Up next: {product.visual.episode}
					</p>
				</div>
			</div>
		);
	}

	// Branded Content Partnerships mock
	return (
		<div className="overflow-hidden rounded-xl border border-white/10 bg-cinema-dark">
			<div className="relative aspect-video bg-gradient-to-br from-teal-900/20 to-cinema-dark">
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="flex items-center gap-6">
						<div className="flex flex-col items-center">
							<div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
								MC
							</div>
							<p className="mt-2 text-xs text-cinema-muted">
								{"creator" in product.visual
									? product.visual.creator
									: ""}
							</p>
						</div>
						<div className="text-2xl text-teal-400">+</div>
						<div className="flex flex-col items-center">
							<div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-300">
								YB
							</div>
							<p className="mt-2 text-xs text-cinema-muted">
								{"brand" in product.visual ? product.visual.brand : ""}
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="border-t border-white/5 p-4 text-center">
				<p className="font-semibold text-white">
					{"collab" in product.visual ? product.visual.collab : ""}
				</p>
				<p className="text-xs text-cinema-muted">
					A collaboration between creator and brand
				</p>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Audience Insight Visual Components                                         */
/* -------------------------------------------------------------------------- */

function AudienceInsightVisual({
	insight,
}: {
	insight: (typeof audienceInsights)[number];
}) {
	if ("metrics" in insight && insight.metrics) {
		// Genre distribution bars
		return (
			<div className="space-y-3">
				{insight.metrics.map((m) => (
					<div key={m.genre} className="flex items-center gap-3">
						<span className="w-16 text-xs text-cinema-muted">{m.genre}</span>
						<div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
							<div
								className="h-full rounded-full bg-teal-400/60"
								style={{ width: m.width }}
							/>
						</div>
					</div>
				))}
			</div>
		);
	}

	if ("stats" in insight && insight.stats) {
		// Demographic blocks
		return (
			<div className="grid grid-cols-2 gap-3">
				{insight.stats.map((s) => (
					<div
						key={s.label}
						className="rounded-lg bg-white/5 p-3 text-center"
					>
						<p className="text-lg font-bold text-teal-400">{s.value}</p>
						<p className="text-xs text-cinema-muted">{s.label}</p>
					</div>
				))}
			</div>
		);
	}

	if ("comparison" in insight && insight.comparison) {
		// Comparison table
		return (
			<div className="overflow-hidden rounded-lg border border-white/5">
				<div className="grid grid-cols-3 gap-px bg-white/5 text-xs">
					<div className="bg-cinema-dark p-2 font-medium text-cinema-muted" />
					<div className="bg-cinema-dark p-2 text-center font-bold text-teal-400">
						Paid
					</div>
					<div className="bg-cinema-dark p-2 text-center font-medium text-cinema-muted">
						Free
					</div>
					{insight.comparison.map((row) => (
						<>
							<div
								key={`${row.label}-label`}
								className="bg-cinema-dark p-2 text-cinema-muted"
							>
								{row.label}
							</div>
							<div
								key={`${row.label}-paid`}
								className="bg-cinema-dark p-2 text-center font-semibold text-white"
							>
								{row.paid}
							</div>
							<div
								key={`${row.label}-free`}
								className="bg-cinema-dark p-2 text-center text-cinema-muted"
							>
								{row.free}
							</div>
						</>
					))}
				</div>
			</div>
		);
	}

	return null;
}
