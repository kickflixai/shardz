import { ClipboardCheck, Upload, Tag, Banknote } from "lucide-react";

const howItWorksSteps = [
	{
		step: 1,
		title: "Apply",
		description:
			"Submit your portfolio for review. We curate for quality, not follower count.",
		icon: ClipboardCheck,
	},
	{
		step: 2,
		title: "Upload",
		description:
			"Add your series, seasons, and episodes. Organize your catalog the way you want.",
		icon: Upload,
	},
	{
		step: 3,
		title: "Price",
		description:
			"Set per-season pricing from $0.99 to $9.99. You decide what your work is worth.",
		icon: Tag,
	},
	{
		step: 4,
		title: "Earn",
		description:
			"Payouts via Stripe Connect. You keep 80% of every sale. Transparent, automatic, reliable.",
		icon: Banknote,
	},
];

export function CreatorHowItWorks() {
	return (
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
	);
}
