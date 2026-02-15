import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { PitchSubNav } from "@/components/pitch/pitch-sub-nav";

export default function PitchLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen scroll-smooth bg-cinema-black">
			{/* Minimal header: logo + sub-nav */}
			<header className="fixed top-0 z-50 w-full">
				<div className="flex items-center gap-6 px-6 py-4">
					<Link
						href="/"
						className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
					>
						<Image src="/logo.png" alt="Shardz" width={24} height={24} />
						<span className="text-sm font-bold uppercase tracking-[0.15em] text-white/60">
							Shardz
						</span>
					</Link>
					<PitchSubNav />
				</div>
			</header>

			{children}
		</div>
	);
}
