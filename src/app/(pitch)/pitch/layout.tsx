import type { ReactNode } from "react";
import Link from "next/link";

export default function PitchLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen scroll-smooth bg-cinema-black">
			{/* Minimal header: logo only */}
			<header className="fixed top-0 z-50 w-full">
				<div className="px-6 py-4">
					<Link
						href="/"
						className="text-sm font-bold uppercase tracking-[0.15em] text-white/60 transition-colors hover:text-white"
					>
						MicroShort
					</Link>
				</div>
			</header>

			{children}
		</div>
	);
}
