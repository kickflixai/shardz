import {
	Film,
	Users,
	Music,
	Trophy,
	Sparkles,
	Clapperboard,
	type LucideIcon,
} from "lucide-react";

export interface CreatorType {
	slug: string;
	label: string;
	title: string;
	description: string;
	icon: LucideIcon;
	heroHeadline: string;
	heroSubheadline: string;
	targetAudience: string[];
	monetizationAngles: string[];
	studioRelevant: boolean;
	remotionCompositions: string[];
	valuePropHeadline: string;
	valuePropDescription: string;
	valuePropPoints: string[];
}

export const CREATOR_TYPES: CreatorType[] = [
	{
		slug: "filmmakers",
		label: "Filmmakers & Studios",
		title: "Filmmakers",
		description:
			"Distribute your films directly to paying audiences — no middlemen, no festival gatekeepers.",
		icon: Film,
		heroHeadline: "Your Films Deserve More Than Festival Circuits",
		heroSubheadline:
			"Own your catalog. Sell directly to fans. Keep 80% of every dollar.",
		targetAudience: [
			"Independent filmmakers",
			"Film students",
			"Micro-studios",
			"Documentary creators",
		],
		monetizationAngles: [
			"Per-season pricing",
			"Catalog ownership",
			"Genre discovery",
			"Direct fan sales",
		],
		studioRelevant: true,
		remotionCompositions: ["player", "browse", "paywall", "dashboard"],
		valuePropHeadline: "Your films deserve more than festival circuits",
		valuePropDescription:
			"Stop waiting for distribution deals. Upload your films, set your price, and reach audiences directly through genre-based discovery.",
		valuePropPoints: [
			"Own your entire catalog — no licensing deals required",
			"Genre-based discovery puts your work in front of the right audience",
			"Direct sales mean real revenue, not exposure",
			"Analytics show you exactly what resonates with viewers",
		],
	},
	{
		slug: "influencers",
		label: "Influencers",
		title: "Influencers",
		description:
			"Turn your audience into paying subscribers with exclusive behind-the-scenes content.",
		icon: Users,
		heroHeadline: "Your Audience Wants Exclusive Content",
		heroSubheadline:
			"Monetize BTS, vlogs, and premium content your followers can't get anywhere else.",
		targetAudience: [
			"YouTube creators",
			"TikTok personalities",
			"Lifestyle influencers",
			"Content creators",
		],
		monetizationAngles: [
			"BTS monetization",
			"Community engagement",
			"Recurring revenue",
			"Premium exclusives",
		],
		studioRelevant: false,
		remotionCompositions: ["social", "dashboard", "formats"],
		valuePropHeadline: "Your audience wants exclusive content",
		valuePropDescription:
			"Your followers already engage for free. Give them premium, behind-the-scenes content worth paying for — and keep 80% of every sale.",
		valuePropPoints: [
			"BTS content your audience can't get on free platforms",
			"Community engagement through live reactions and comments",
			"Recurring revenue from loyal fans, not algorithm-dependent views",
			"Full analytics on what content drives the most engagement",
		],
	},
	{
		slug: "musicians",
		label: "Musicians",
		title: "Musicians",
		description:
			"Visual albums, studio sessions, and concert footage that earn real revenue.",
		icon: Music,
		heroHeadline: "Visual Albums and BTS That Earn",
		heroSubheadline:
			"Your music videos, studio sessions, and concert footage deserve a monetization layer.",
		targetAudience: [
			"Independent musicians",
			"Bands",
			"Music producers",
			"Concert filmers",
		],
		monetizationAngles: [
			"Music video series",
			"Studio session BTS",
			"Concert footage",
			"Visual albums",
		],
		studioRelevant: true,
		remotionCompositions: ["player", "social", "formats"],
		valuePropHeadline: "Visual albums and BTS that earn",
		valuePropDescription:
			"Music videos get billions of views but musicians see pennies. Sell your visual content directly — studio sessions, concert footage, and visual albums.",
		valuePropPoints: [
			"Package music videos into bingeable series",
			"Sell studio session BTS your fans crave",
			"Concert footage becomes premium content, not free uploads",
			"Visual albums with real per-season pricing",
		],
	},
	{
		slug: "sports",
		label: "Sports Teams",
		title: "Sports",
		description:
			"Season content, player spotlights, and BTS that fans will pay for — zero acting required.",
		icon: Trophy,
		heroHeadline: "Season Content Your Fans Will Pay For",
		heroSubheadline:
			"Behind-the-scenes during the season, player spotlights, training footage — real content, real revenue.",
		targetAudience: [
			"College teams",
			"Minor league teams",
			"Esports orgs",
			"Amateur sports clubs",
		],
		monetizationAngles: [
			"Season BTS series",
			"Player spotlights",
			"Training footage",
			"Fan engagement",
		],
		studioRelevant: true,
		remotionCompositions: ["social", "formats", "dashboard"],
		valuePropHeadline: "Season content your fans will pay for",
		valuePropDescription:
			"Your fans already follow every game. Give them exclusive access to the locker room, training sessions, and player stories — and monetize the passion they already have.",
		valuePropPoints: [
			"Behind-the-scenes during the season — zero acting required",
			"Player spotlight series that build individual brands",
			"Training and workout footage fans love",
			"Real-time engagement during game days",
		],
	},
	{
		slug: "ai-filmmakers",
		label: "AI Filmmakers",
		title: "AI Filmmakers",
		description:
			"The platform built for AI cinema — AI-native tools, an emerging genre, and free Shardz Studio training.",
		icon: Sparkles,
		heroHeadline: "The Platform Built for AI Cinema",
		heroSubheadline:
			"AI filmmaking is a new genre. Shardz is the first platform designed to showcase and monetize it.",
		targetAudience: [
			"AI artists",
			"Prompt engineers",
			"Digital creators",
			"Tech-forward filmmakers",
		],
		monetizationAngles: [
			"AI-native tools",
			"Emerging genre discovery",
			"Shardz Studio training",
			"Low-cost production",
		],
		studioRelevant: true,
		remotionCompositions: ["ai-tools", "player", "browse", "paywall"],
		valuePropHeadline: "The platform built for AI cinema",
		valuePropDescription:
			"AI filmmaking is the fastest-growing content category. Shardz is the first platform built specifically to help AI filmmakers create, learn, and earn.",
		valuePropPoints: [
			"AI-native creation tools integrated into the platform",
			"Free training at Shardz Studio — from script to published series",
			"An audience hungry for the next wave of digital cinema",
			"Production costs under $5K enable real per-series profitability",
		],
	},
	{
		slug: "general",
		label: "All Creators",
		title: "All Creators",
		description:
			"Whatever you create, own it. Every format, every genre, every tool — all in one platform.",
		icon: Clapperboard,
		heroHeadline: "Whatever You Create, Own It",
		heroSubheadline:
			"One platform for every format. Upload, price, and sell your content directly to fans.",
		targetAudience: [
			"All content creators",
			"Multi-format creators",
			"Emerging creators",
			"Creative professionals",
		],
		monetizationAngles: [
			"Format-agnostic",
			"Full analytics suite",
			"80% revenue share",
			"Stripe payouts",
		],
		studioRelevant: true,
		remotionCompositions: [
			"player",
			"browse",
			"paywall",
			"dashboard",
			"social",
			"ai-tools",
			"formats",
		],
		valuePropHeadline: "Whatever you create, own it",
		valuePropDescription:
			"Shardz works for every content format — scripted series, BTS, tutorials, music videos, AI cinema, and more. Set your price, keep 80%, and grow your audience.",
		valuePropPoints: [
			"Every format earns — scripted, BTS, tutorials, music, sports, AI",
			"80% revenue share with transparent Stripe payouts",
			"Self-serve upload with no gatekeepers or approval queues",
			"Full analytics dashboard to track views, revenue, and growth",
		],
	},
];

export function getCreatorType(slug: string): CreatorType | undefined {
	return CREATOR_TYPES.find((ct) => ct.slug === slug);
}

export function getCreatorTypeSlugs(): string[] {
	return CREATOR_TYPES.map((ct) => ct.slug);
}
