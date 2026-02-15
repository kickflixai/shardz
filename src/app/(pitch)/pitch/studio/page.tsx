import type { Metadata } from "next";
import { HeroSection } from "@/components/pitch/hero-section";
import { FeatureSection } from "@/components/pitch/feature-section";
import { CTASection } from "@/components/pitch/cta-section";
import {
	BookOpen,
	Palette,
	Video,
	AudioLines,
	BarChart3,
	Rocket,
	GraduationCap,
	Check,
	ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
	title: "Shardz Studio | Free AI Filmmaking Training for Creators",
	description:
		"Master AI filmmaking with free expert-led training. From AI scripting and visual production to publishing your first series on Shardz.",
};

const curriculumTracks = [
	{
		title: "AI Script & Story",
		description:
			"Learn to craft compelling narratives using AI writing tools. Prompt engineering for dialogue, character arcs, world-building, and episodic structure that keeps viewers coming back.",
		icon: BookOpen,
		modules: ["Prompt engineering for scripts", "Episodic story structure", "Character & dialogue craft", "World-building with AI"],
	},
	{
		title: "AI Visual Production",
		description:
			"Generate cinematic stills, consistent characters, and production-ready assets with AI image tools. Learn style consistency, compositing, and visual storytelling techniques.",
		icon: Palette,
		modules: ["AI image generation mastery", "Character consistency methods", "Compositing & scene design", "Style guides & art direction"],
	},
	{
		title: "AI Video & Animation",
		description:
			"Turn static images into dynamic video. Master AI video generation, motion techniques, camera movement, and editing workflows that bring your series to life.",
		icon: Video,
		modules: ["AI video generation tools", "Motion & camera techniques", "Editing for short-form", "Transitions & pacing"],
	},
	{
		title: "AI Audio & Music",
		description:
			"Create original scores, sound effects, and voice performances using AI audio tools. Learn mixing, mastering, and how to build an audio identity for your series.",
		icon: AudioLines,
		modules: ["AI music composition", "Sound design & SFX", "AI voice generation", "Mixing & audio polish"],
	},
	{
		title: "Platform Mastery",
		description:
			"Optimize your presence on Shardz. Learn pricing strategy, thumbnail design, analytics interpretation, and audience growth tactics specific to the platform.",
		icon: BarChart3,
		modules: ["Pricing & monetization strategy", "Thumbnail & metadata optimization", "Analytics-driven growth", "Audience retention techniques"],
	},
	{
		title: "From Zero to Series",
		description:
			"A complete end-to-end track. Go from blank page to published, monetized series in 30 days. Combines every skill into a guided production pipeline.",
		icon: Rocket,
		modules: ["30-day production roadmap", "End-to-end workflow", "Publishing & launch strategy", "First revenue playbook"],
	},
];

const whyFreeReasons = [
	{
		title: "Better creators make better content",
		description:
			"When creators master AI filmmaking tools, the quality of content on Shardz rises. Higher quality means higher conversion rates, more revenue, and a stronger marketplace.",
	},
	{
		title: "Lower barrier to entry drives supply",
		description:
			"Traditional film production costs $50K+. AI-assisted production costs under $5K. Free training drops the barrier to near zero. More creators means more content, more genres, more viewers.",
	},
	{
		title: "Education creates platform loyalty",
		description:
			"Creators who learn on Shardz publish on Shardz. The training is platform-specific, the community is here, and the path from learning to earning is seamless.",
	},
	{
		title: "The flywheel accelerates growth",
		description:
			"Free education attracts creators. Trained creators produce quality content. Quality content attracts viewers. Viewers drive revenue. Revenue attracts more creators. The cycle compounds.",
	},
];

const costComparisons = [
	{
		category: "Film Education",
		traditional: { label: "Traditional Film School", cost: "$30,000 - $120,000", duration: "2-4 years", note: "Limited AI curriculum, outdated workflows" },
		shardz: { label: "Shardz Studio", cost: "Free", duration: "Self-paced", note: "AI-native curriculum, always up to date" },
	},
	{
		category: "Production Costs",
		traditional: { label: "Traditional Production", cost: "$50,000+", duration: "3-12 months", note: "Crew, equipment, post-production, distribution" },
		shardz: { label: "AI-Assisted Production", cost: "Under $5,000", duration: "2-4 weeks", note: "AI tools for script, visual, video, and audio" },
	},
];

export default function StudioPage() {
	return (
		<main>
			{/* 1. Hero */}
			<HeroSection
				variant="creator"
				badge="Shardz Studio"
				headline="Master AI Filmmaking"
				subheadline="Free expert-led training for every creator. Learn AI scripting, visual production, video generation, and audio design -- then publish and monetize your series on Shardz."
			/>

			{/* 2. What Is Shardz Studio */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-4xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						The Mission
					</h2>
					<p className="mx-auto mb-8 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						What Is Shardz Studio?
					</p>
					<div className="mx-auto max-w-3xl space-y-6 text-center">
						<p className="text-lg leading-relaxed text-cinema-muted">
							Shardz Studio is a free, comprehensive training program built for creators who want to
							make professional short-form series using AI tools. No film school degree required. No
							expensive equipment. No gatekeepers.
						</p>
						<p className="text-lg leading-relaxed text-cinema-muted">
							Every track is designed by working filmmakers and AI practitioners who understand both
							the creative craft and the technical tools. The curriculum evolves as AI capabilities
							advance -- so you are always learning the most current workflows.
						</p>
						<p className="text-lg leading-relaxed text-white">
							The goal is simple: take you from zero experience to a published, monetized series on
							Shardz. Every lesson maps directly to a step in the production pipeline.
						</p>
					</div>

					<div className="mx-auto mt-12 flex max-w-2xl items-center justify-center gap-8">
						<div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-yellow/20 bg-brand-yellow/10">
							<GraduationCap className="h-10 w-10 text-brand-yellow" />
						</div>
						<div className="text-left">
							<div className="text-3xl font-extrabold text-brand-yellow">
								100% Free
							</div>
							<div className="mt-1 text-sm text-cinema-muted">
								Included with every Shardz creator account. No upsells, no paywalls, no hidden costs.
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 3. Curriculum Overview */}
			<section className="bg-gradient-to-b from-cinema-black via-[rgba(224,184,0,0.02)] to-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						Curriculum
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Six tracks. Every skill you need.
					</p>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{curriculumTracks.map((track) => {
							const Icon = track.icon;
							return (
								<div
									key={track.title}
									className="group rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-brand-yellow/20 hover:bg-brand-yellow/5"
								>
									<div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-colors group-hover:border-brand-yellow/20 group-hover:bg-brand-yellow/10">
										<Icon className="h-7 w-7 text-cinema-muted transition-colors group-hover:text-brand-yellow" />
									</div>
									<h3 className="text-lg font-bold text-white">
										{track.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-cinema-muted">
										{track.description}
									</p>
									<ul className="mt-4 space-y-2">
										{track.modules.map((mod) => (
											<li
												key={mod}
												className="flex items-center gap-2 text-xs text-cinema-muted/80"
											>
												<Check className="h-3 w-3 shrink-0 text-brand-yellow/60" />
												{mod}
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* 4. Why It's Free */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						The Strategy
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Why Shardz Studio is free
					</p>

					<div className="grid gap-6 sm:grid-cols-2">
						{whyFreeReasons.map((reason) => (
							<div
								key={reason.title}
								className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:border-brand-yellow/10"
							>
								<div className="mb-3 inline-flex items-center rounded-full bg-brand-yellow/10 px-3 py-1">
									<ArrowRight className="mr-1.5 h-3.5 w-3.5 text-brand-yellow" />
									<span className="text-xs font-bold text-brand-yellow">
										Strategic advantage
									</span>
								</div>
								<h3 className="text-lg font-bold text-white">
									{reason.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-cinema-muted">
									{reason.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 5. Cost Comparison */}
			<section className="bg-gradient-to-b from-cinema-black via-[rgba(224,184,0,0.02)] to-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						The Numbers
					</h2>
					<p className="mx-auto mb-16 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						The old way vs. the Shardz way
					</p>

					<div className="space-y-8">
						{costComparisons.map((comp) => (
							<div key={comp.category}>
								<h3 className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-cinema-muted">
									{comp.category}
								</h3>
								<div className="grid gap-4 sm:grid-cols-2">
									{/* Traditional */}
									<div className="rounded-2xl border border-white/5 bg-white/[0.03] p-8">
										<div className="mb-4 text-xs font-bold uppercase tracking-widest text-cinema-muted">
											{comp.traditional.label}
										</div>
										<div className="text-3xl font-extrabold text-cinema-muted/60">
											{comp.traditional.cost}
										</div>
										<div className="mt-2 text-sm text-cinema-muted">
											{comp.traditional.duration}
										</div>
										<div className="mt-3 text-xs text-cinema-muted/60">
											{comp.traditional.note}
										</div>
									</div>

									{/* Shardz */}
									<div className="rounded-2xl border border-brand-yellow/20 bg-brand-yellow/5 p-8">
										<div className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-yellow">
											{comp.shardz.label}
										</div>
										<div className="text-3xl font-extrabold text-brand-yellow">
											{comp.shardz.cost}
										</div>
										<div className="mt-2 text-sm text-white">
											{comp.shardz.duration}
										</div>
										<div className="mt-3 text-xs text-cinema-muted">
											{comp.shardz.note}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 6. AI Creation Tools Feature */}
			<FeatureSection
				variant="creator"
				features={[
					{
						title: "AI-Powered Creation Tools",
						description:
							"Shardz Studio teaches the tools -- and the platform provides them. Write scripts with AI prompting, generate thumbnails, add subtitles, and produce entire episodes using AI workflows you learn in the curriculum. The gap between learning and doing is zero.",
						composition: "ai-tools" as const,
					},
				]}
			/>

			{/* 7. CTA */}
			<CTASection
				variant="creator"
				primaryCTA={{ label: "Start Creating", href: "/dashboard/apply" }}
				secondaryCTA={{ label: "Explore the Platform", href: "/browse" }}
				tagline="Free training. Real skills. Your series, published and earning."
			/>
		</main>
	);
}
