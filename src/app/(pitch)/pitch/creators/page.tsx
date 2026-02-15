import type { Metadata } from "next";
import { HeroSection } from "@/components/pitch/hero-section";
import { FeatureSection } from "@/components/pitch/feature-section";
import { CTASection } from "@/components/pitch/cta-section";
import {
	Sparkles,
	Film,
	Laugh,
	Music,
	Users,
	ClipboardCheck,
	Upload,
	Tag,
	Banknote,
} from "lucide-react";

export const metadata: Metadata = {
	title: "MicroShort for Creators | Monetize Your Short-Form Series",
	description:
		"Keep 80% of every sale. Upload short-form series, set your price, and earn directly from your audience on MicroShort.",
};

const creatorFeatures = [
	{
		title: "Self-Serve Upload",
		description:
			"Upload your series, set your price, and start earning. Full control over your catalog. No gatekeepers, no algorithms deciding your fate.",
		composition: "dashboard" as const,
	},
	{
		title: "Genre Discovery",
		description:
			"Your series appears alongside the best short-form content. Genre-based browsing puts you in front of the right audience -- people who are looking for exactly what you make.",
		composition: "browse" as const,
	},
	{
		title: "Free Episode Hooks",
		description:
			"First 3 episodes free. Viewers get hooked, then pay to unlock the full season. The conversion funnel is built into the product. You just make great content.",
		composition: "paywall" as const,
	},
	{
		title: "Full-Funnel Analytics",
		description:
			"See exactly how viewers find you, watch, and convert. Track views, unlock rates, and revenue per series. Data-driven growth, not guesswork.",
		composition: "dashboard" as const,
	},
];

const creatorTypes = [
	{
		title: "AI Filmmakers",
		description: "Push the boundaries of AI-generated storytelling",
		icon: Sparkles,
	},
	{
		title: "Indie Studios",
		description: "Give your short films a dedicated home and revenue stream",
		icon: Film,
	},
	{
		title: "Comedy Creators",
		description: "Your sketches are worth more than ad impressions",
		icon: Laugh,
	},
	{
		title: "Music Artists",
		description:
			"Music series, visual albums, behind-the-scenes -- all monetized",
		icon: Music,
	},
	{
		title: "Influencers",
		description:
			"Turn your audience into paying subscribers for premium content",
		icon: Users,
	},
];

const howItWorksSteps = [
	{
		step: 1,
		title: "Apply",
		description: "Submit your portfolio for review. We curate for quality, not follower count.",
		icon: ClipboardCheck,
	},
	{
		step: 2,
		title: "Upload",
		description: "Add your series, seasons, and episodes. Organize your catalog the way you want.",
		icon: Upload,
	},
	{
		step: 3,
		title: "Price",
		description: "Set per-season pricing from $0.99 to $7.99. You decide what your work is worth.",
		icon: Tag,
	},
	{
		step: 4,
		title: "Earn",
		description: "Payouts via Stripe Connect. You keep 80% of every sale. Transparent, automatic, reliable.",
		icon: Banknote,
	},
];

export default function CreatorPitchPage() {
	return (
		<main>
			{/* 1. Hero */}
			<HeroSection
				variant="creator"
				headline="Your Short-Form Content Deserves to Earn"
				subheadline="MicroShort gives you a platform purpose-built for short-form series. Upload, price, and sell directly to your audience. Keep 80% of every sale."
			/>

			{/* 2. Economics Section */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
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

					{/* Economics comparison cards */}
					<div className="grid gap-6 sm:grid-cols-3">
						<div className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
							<div className="mb-2 text-xs font-bold uppercase tracking-widest text-cinema-muted">
								Ad-Based Platforms
							</div>
							<div className="text-3xl font-extrabold text-cinema-muted/60">
								$0.02-0.04
							</div>
							<div className="mt-1 text-sm text-cinema-muted">
								Average CPM per view
							</div>
							<div className="mt-3 text-xs text-cinema-muted/60">
								Thousands of views for a few dollars
							</div>
						</div>

						<div className="rounded-2xl border border-brand-yellow/20 bg-brand-yellow/5 p-8 backdrop-blur-sm">
							<div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-yellow">
								MicroShort
							</div>
							<div className="text-3xl font-extrabold text-brand-yellow">
								$4.99
							</div>
							<div className="mt-1 text-sm text-white">
								Per season unlock
							</div>
							<div className="mt-3 text-xs text-cinema-muted">
								One fan, one purchase, real revenue
							</div>
						</div>

						<div className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
							<div className="mb-2 text-xs font-bold uppercase tracking-widest text-cinema-muted">
								The Math
							</div>
							<div className="text-3xl font-extrabold text-white">
								$399
							</div>
							<div className="mt-1 text-sm text-cinema-muted">
								100 fans x $4.99 = $399 to you
							</div>
							<div className="mt-3 text-xs text-cinema-muted/60">
								Price per season: $0.99 - $7.99
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 3. Platform Features with Remotion demos */}
			<FeatureSection variant="creator" features={creatorFeatures} />

			{/* 4. Who This Is For */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						Who This Is For
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Built for creators who make content worth paying for
					</p>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{creatorTypes.map((type) => {
							const Icon = type.icon;
							return (
								<div
									key={type.title}
									className="group rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-brand-yellow/20 hover:bg-brand-yellow/5"
								>
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors group-hover:border-brand-yellow/20 group-hover:bg-brand-yellow/10">
										<Icon className="h-6 w-6 text-cinema-muted transition-colors group-hover:text-brand-yellow" />
									</div>
									<h3 className="text-lg font-bold text-white">
										{type.title}
									</h3>
									<p className="mt-1 text-sm text-cinema-muted">
										{type.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* 5. How It Works */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-4xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						How It Works
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Four steps to your first sale
					</p>

					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
						{howItWorksSteps.map((item) => {
							const Icon = item.icon;
							return (
								<div key={item.step} className="text-center">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-yellow/20 bg-brand-yellow/10">
										<Icon className="h-7 w-7 text-brand-yellow" />
									</div>
									<div className="mb-2 text-sm font-bold text-brand-yellow">
										Step {item.step}
									</div>
									<h3 className="text-xl font-bold text-white">
										{item.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-cinema-muted">
										{item.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* 6. CTA */}
			<CTASection
				variant="creator"
				primaryCTA={{ label: "Apply Now", href: "/dashboard/apply" }}
				secondaryCTA={{ label: "Explore the Platform", href: "/browse" }}
				tagline="The platform that pays creators what they're worth."
			/>
		</main>
	);
}
