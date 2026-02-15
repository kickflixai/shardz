import type { Metadata } from "next";
import { CreatorHero } from "@/components/creators/creator-hero";
import { EconomicsSection } from "@/components/creators/economics-section";
import { FeatureGrid } from "@/components/creators/feature-grid";
import { WaitlistForm } from "@/components/creators/waitlist-form";

export const metadata: Metadata = {
	title: "Create on Shardz | Monetize Short-Form Series",
	description:
		"Upload short-form series, set your price, keep 80%. Join the platform built for creators.",
};

export default function CreatorsPage() {
	return (
		<>
			<CreatorHero />
			<EconomicsSection />
			<FeatureGrid />
			<WaitlistForm />
		</>
	);
}
