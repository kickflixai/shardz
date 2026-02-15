import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { HeroSection } from "@/components/pitch/hero-section";
import { FeatureSection } from "@/components/pitch/feature-section";
import { CTASection } from "@/components/pitch/cta-section";
import { CreatorEconomics } from "@/components/pitch/creator-economics";
import { CreatorHowItWorks } from "@/components/pitch/creator-how-it-works";
import { StudioCallout } from "@/components/pitch/studio-callout";
import { getCreatorType, getCreatorTypeSlugs } from "@/lib/pitch/creator-types";
import type { CompositionName } from "@/components/pitch/remotion-feature";

/* -------------------------------------------------------------------------- */
/*  Composition metadata for FeatureSection                                    */
/* -------------------------------------------------------------------------- */

const compositionMeta: Record<string, { title: string; description: string }> =
	{
		player: {
			title: "Cinematic Player",
			description:
				"Full-screen, mobile-first playback with auto-play next episode.",
		},
		browse: {
			title: "Genre Discovery",
			description:
				"Viewers find your content through genre-based browsing.",
		},
		paywall: {
			title: "Free Episode Hooks",
			description:
				"First 3 episodes free. Viewers get hooked, then unlock the season.",
		},
		dashboard: {
			title: "Creator Dashboard",
			description:
				"Track views, revenue, and growth with full-funnel analytics.",
		},
		social: {
			title: "Social Engagement",
			description:
				"Real-time emoji reactions and timestamped comments.",
		},
		"ai-tools": {
			title: "AI Creation Suite",
			description:
				"Write scripts, generate thumbnails, add subtitles — all AI-powered.",
		},
		formats: {
			title: "Multi-Format Support",
			description:
				"Scripted series, BTS, tutorials, music — every format monetized.",
		},
	};

/* -------------------------------------------------------------------------- */
/*  Static params & metadata                                                   */
/* -------------------------------------------------------------------------- */

export function generateStaticParams() {
	return getCreatorTypeSlugs().map((type) => ({ type }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ type: string }>;
}): Promise<Metadata> {
	const { type } = await params;
	const ct = getCreatorType(type);

	if (!ct) {
		return {
			title: "Shardz for Creators",
		};
	}

	return {
		title: `Shardz for ${ct.label} | ${ct.heroHeadline}`,
		description: ct.heroSubheadline,
	};
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                             */
/* -------------------------------------------------------------------------- */

export default async function CreatorTypePage({
	params,
}: {
	params: Promise<{ type: string }>;
}) {
	const { type } = await params;
	const ct = getCreatorType(type);

	if (!ct) {
		notFound();
	}

	const isGeneral = ct.slug === "general";

	// Build features array from the creator type's remotionCompositions
	const features = ct.remotionCompositions
		.filter((name) => name in compositionMeta)
		.map((name) => ({
			title: compositionMeta[name].title,
			description: compositionMeta[name].description,
			composition: name as CompositionName,
		}));

	return (
		<main>
			{/* 1. Hero */}
			<HeroSection
				variant="creator"
				badge={`For ${ct.label}`}
				headline={ct.heroHeadline}
				subheadline={ct.heroSubheadline}
			/>

			{/* 2. Type-specific value proposition */}
			<section className="bg-cinema-black px-6 py-24 md:py-32">
				<div className="mx-auto max-w-4xl">
					<h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
						Why Shardz
					</h2>
					<p className="mx-auto mb-6 max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
						{ct.valuePropHeadline}
					</p>
					<p className="mx-auto mb-12 max-w-2xl text-center text-lg leading-relaxed text-cinema-muted">
						{ct.valuePropDescription}
					</p>

					<div className="mx-auto max-w-2xl space-y-4">
						{ct.valuePropPoints.map((point) => (
							<div
								key={point}
								className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-5 transition-colors hover:border-brand-yellow/10"
							>
								<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
								<p className="text-base leading-relaxed text-cinema-muted">
									{point}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 3. Creator Economics */}
			<CreatorEconomics compact={!isGeneral} />

			{/* 4. Platform Features with Remotion demos */}
			{features.length > 0 && (
				<FeatureSection variant="creator" features={features} />
			)}

			{/* 5. How It Works */}
			<CreatorHowItWorks />

			{/* 6. Shardz Studio Callout (if relevant) */}
			{ct.studioRelevant && <StudioCallout />}

			{/* 7. CTA */}
			<CTASection
				variant="creator"
				primaryCTA={{ label: "Apply Now", href: "/dashboard/apply" }}
				secondaryCTA={{
					label: "Back to Creator Hub",
					href: "/pitch/creators",
				}}
				tagline="The platform that pays creators what they're worth."
			/>
		</main>
	);
}
