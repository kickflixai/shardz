import type { Metadata } from "next";
import Link from "next/link";
import {
	TrendingUp,
	Megaphone,
	Lightbulb,
	Film,
	ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
	title: "MicroShort - The Missing Monetization Layer for Short-Form Video",
	description:
		"MicroShort is the premium marketplace for short-form video series. Explore our pitch for investors, brands, advisors, and creators.",
};

const stakeholderPages = [
	{
		title: "For Investors",
		description: "The market gap opportunity in premium short-form video",
		href: "/pitch/investors",
		icon: TrendingUp,
		accentClass: "group-hover:text-brand-yellow group-hover:border-brand-yellow/30",
	},
	{
		title: "For Brands",
		description: "Genre-targeted advertising in a brand-safe environment",
		href: "/pitch/brands",
		icon: Megaphone,
		accentClass: "group-hover:text-teal-400 group-hover:border-teal-400/30",
	},
	{
		title: "For Advisors",
		description: "Shape the future of short-form video monetization",
		href: "/pitch/advisors",
		icon: Lightbulb,
		accentClass: "group-hover:text-amber-400 group-hover:border-amber-400/30",
	},
	{
		title: "For Creators",
		description: "Keep 80% of every sale on a platform built for your format",
		href: "/pitch/creators",
		icon: Film,
		accentClass: "group-hover:text-brand-yellow group-hover:border-brand-yellow/30",
	},
];

export default function PitchHubPage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
			{/* Title / Wordmark */}
			<div className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cinema-muted">
				Pitch
			</div>
			<h1 className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
				Micro<span className="text-brand-yellow">Short</span>
			</h1>
			<p className="mx-auto mt-6 max-w-xl text-center text-lg text-cinema-muted md:text-xl">
				The missing monetization layer for short-form video. A premium
				marketplace where creators earn and audiences pay for quality.
			</p>

			{/* Stakeholder cards */}
			<div className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-2">
				{stakeholderPages.map((page) => {
					const Icon = page.icon;
					return (
						<Link
							key={page.href}
							href={page.href}
							className="group relative flex items-start gap-4 rounded-2xl border border-cinema-border bg-cinema-dark p-6 transition-all duration-300 hover:border-cinema-muted/30 hover:bg-cinema-surface"
						>
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cinema-border bg-cinema-surface transition-colors group-hover:border-cinema-muted/30">
								<Icon className="h-5 w-5 text-cinema-muted transition-colors group-hover:text-white" />
							</div>
							<div className="flex-1">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-bold text-white">
										{page.title}
									</h2>
									<ArrowRight className="h-4 w-4 text-cinema-muted transition-transform group-hover:translate-x-1 group-hover:text-white" />
								</div>
								<p className="mt-1 text-sm text-cinema-muted">
									{page.description}
								</p>
							</div>
						</Link>
					);
				})}
			</div>
		</main>
	);
}
