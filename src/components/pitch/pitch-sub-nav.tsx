"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CREATOR_TYPES } from "@/lib/pitch/creator-types";

const pitchLinks = [
	{ href: "/pitch/investors", label: "Investors" },
	{ href: "/pitch/brands", label: "Brands" },
	{ href: "/pitch/advisors", label: "Advisors" },
	{ href: "/pitch/creators", label: "Creators" },
	{ href: "/pitch/studio", label: "Studio" },
	{ href: "/pitch/platform", label: "Platform" },
];

export function PitchSubNav() {
	const pathname = usePathname();
	const isCreatorSection = pathname.startsWith("/pitch/creators");

	return (
		<div className="flex flex-col gap-1">
			<nav className="flex items-center gap-4 overflow-x-auto">
				{pitchLinks.map((link) => {
					const isActive =
						link.href === "/pitch/creators"
							? isCreatorSection
							: pathname.startsWith(link.href);
					return (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								"whitespace-nowrap text-xs font-medium transition-colors",
								isActive
									? "text-white/70"
									: "text-white/40 hover:text-white/60",
							)}
						>
							{link.label}
						</Link>
					);
				})}
			</nav>

			{/* Secondary row: creator type links when in /pitch/creators/* */}
			{isCreatorSection && (
				<nav className="flex items-center gap-3 overflow-x-auto pb-0.5">
					{CREATOR_TYPES.map((ct) => {
						const href = `/pitch/creators/${ct.slug}`;
						const isActive = pathname === href;
						return (
							<Link
								key={ct.slug}
								href={href}
								className={cn(
									"whitespace-nowrap text-[10px] font-medium transition-colors",
									isActive
										? "text-brand-yellow"
										: "text-white/30 hover:text-white/50",
								)}
							>
								{ct.label}
							</Link>
						);
					})}
				</nav>
			)}
		</div>
	);
}
