import {
	Film,
	DollarSign,
	BarChart3,
	Users,
	Search,
	Wallet,
} from "lucide-react";

const features = [
	{
		title: "Upload Your Series",
		description:
			"Drag and drop your episodes. Set thumbnails, descriptions, and content warnings.",
		icon: Film,
	},
	{
		title: "Set Your Price",
		description:
			"Per-season pricing from $0.99 to $7.99. You control your business.",
		icon: DollarSign,
	},
	{
		title: "Track Everything",
		description:
			"Full-funnel analytics: views, conversions, revenue, and audience insights.",
		icon: BarChart3,
	},
	{
		title: "Build Community",
		description:
			"Discussion spaces, polls, and direct fan engagement per series.",
		icon: Users,
	},
	{
		title: "Get Discovered",
		description:
			"Genre-based browsing puts your content in front of the right audience.",
		icon: Search,
	},
	{
		title: "Get Paid",
		description:
			"Stripe Connect payouts. 80% creator share. Simple.",
		icon: Wallet,
	},
];

const creatorTypes = [
	"AI Filmmakers",
	"Indie Studios",
	"Comedy Creators",
	"Musicians",
	"Influencers",
	"Documentarians",
];

export function FeatureGrid() {
	return (
		<section className="bg-cinema-black px-6 py-24 md:py-32">
			<div className="mx-auto max-w-6xl">
				{/* Section header */}
				<h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
					Built for Creators
				</h2>
				<p className="mx-auto mt-4 max-w-lg text-center text-lg text-cinema-muted">
					Everything you need to monetize your short-form series.
				</p>

				{/* Feature grid */}
				<div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => {
						const Icon = feature.icon;
						return (
							<div
								key={feature.title}
								className="group rounded-2xl border border-cinema-border bg-cinema-dark p-6 transition-all duration-300 hover:border-cinema-muted/30 hover:bg-cinema-surface"
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cinema-border bg-cinema-surface transition-colors group-hover:border-brand-yellow/30">
									<Icon className="h-5 w-5 text-cinema-muted transition-colors group-hover:text-brand-yellow" />
								</div>
								<h3 className="mt-4 text-lg font-bold text-white">
									{feature.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-cinema-muted">
									{feature.description}
								</p>
							</div>
						);
					})}
				</div>

				{/* Creator types callout */}
				<div className="mt-20 text-center">
					<div className="flex flex-wrap items-center justify-center gap-3">
						{creatorTypes.map((type) => (
							<span
								key={type}
								className="rounded-full border border-cinema-border bg-cinema-dark px-4 py-2 text-sm font-medium text-cinema-muted transition-colors hover:border-brand-yellow/30 hover:text-white"
							>
								{type}
							</span>
						))}
					</div>
					<p className="mx-auto mt-6 max-w-lg text-cinema-muted">
						Whether you&apos;re an AI filmmaker pushing boundaries or
						an indie studio with stories to tell &mdash; MicroShort
						is your platform.
					</p>
				</div>
			</div>
		</section>
	);
}
