"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<>
			<header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
					<Link href="/" className="text-xl font-bold text-primary">
						MicroShort
					</Link>

					<nav className="hidden items-center gap-6 md:flex">
						<Link
							href="/"
							className="text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							Home
						</Link>
						<Link
							href="/browse"
							className="text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							Browse
						</Link>
						<Link
							href="/login"
							className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							Sign In
						</Link>
					</nav>

					<button
						type="button"
						className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
						onClick={() => setMobileMenuOpen(true)}
						aria-label="Open menu"
					>
						<svg
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
							/>
						</svg>
					</button>
				</div>
			</header>
			<div className="h-14" />
			<MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
		</>
	);
}
