import Link from "next/link";

export function CreatorHero() {
	return (
		<section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-cinema-black px-6">
			{/* Subtle radial glow */}
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(224,184,0,0.06)_0%,transparent_60%)]" />

			<div className="relative z-10 mx-auto max-w-4xl text-center">
				<h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
					Short-Form Deserves
					<br />
					<span className="text-brand-yellow">Its Own Home</span>
				</h1>

				<p className="mx-auto mt-6 max-w-2xl text-lg text-cinema-muted sm:text-xl md:text-2xl">
					MicroShort is the first platform purpose-built for short-form
					series. Upload your content, set your price, and reach
					audiences who pay for what they love.
				</p>

				<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
					<Link
						href="/dashboard/apply"
						className="inline-flex items-center rounded-xl bg-brand-yellow px-8 py-4 text-lg font-bold text-cinema-black transition-colors hover:bg-brand-yellow-light"
					>
						Apply Now
					</Link>
					<a
						href="#waitlist"
						className="inline-flex items-center rounded-xl border-2 border-brand-yellow px-8 py-4 text-lg font-bold text-brand-yellow transition-colors hover:bg-brand-yellow/10"
					>
						Join the Waitlist
					</a>
				</div>
			</div>
		</section>
	);
}
