"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/auth/logout-button";
import { useDemoRole } from "@/components/providers/demo-role-provider";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const { demoRole } = useDemoRole();

	useEffect(() => {
		const supabase = createClient();

		supabase.auth.getUser().then(({ data }) => setUser(data.user));

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return (
		<>
			<header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
					<Link href="/" className="flex items-center gap-2">
						<Image src="/logo.png" alt="Shardz" width={28} height={28} />
						<span className="text-xl font-bold text-primary">Shardz</span>
					</Link>

					<nav className="hidden items-center gap-6 md:flex">
						<Link
							href="/"
							className="text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							Home
						</Link>
						<Link
							href="/#browse"
							className="text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							Browse
						</Link>
						<Link
							href="/pitch"
							className="text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							Pitch
						</Link>
						<Link
							href="/dashboard"
							className="text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							Dashboard
						</Link>
						{user ? (
							<LogoutButton />
						) : (
							<Link
								href="/login"
								className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
							>
								Sign In
							</Link>
						)}
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
			<MobileNav
				open={mobileMenuOpen}
				onClose={() => setMobileMenuOpen(false)}
				user={user}
			/>
		</>
	);
}
