"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNav } from "@/components/layout/mobile-nav";

type UserRole = "viewer" | "creator" | "admin";

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [role, setRole] = useState<UserRole>("viewer");

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

	// Fetch user role when user changes
	useEffect(() => {
		if (!user) {
			setRole("viewer");
			return;
		}

		const supabase = createClient();
		supabase
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.single()
			.then(({ data }) => {
				if (data?.role) {
					setRole(data.role as UserRole);
				}
			});
	}, [user]);

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
						{user ? (
							<>
								<Link
									href="/profile"
									className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
								>
									<svg
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="1.5"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
										/>
									</svg>
									Profile
								</Link>
								{(role === "creator" || role === "admin") && (
									<Link
										href="/dashboard"
										className="text-sm text-muted-foreground transition-colors hover:text-primary"
									>
										Dashboard
									</Link>
								)}
								{role === "admin" && (
									<Link
										href="/admin"
										className="text-sm text-muted-foreground transition-colors hover:text-primary"
									>
										Admin
									</Link>
								)}
								<LogoutButton />
							</>
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
				role={role}
			/>
		</>
	);
}
