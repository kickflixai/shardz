"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/auth/logout-button";

type UserRole = "viewer" | "creator" | "admin";

interface MobileNavProps {
	open: boolean;
	onClose: () => void;
	user: User | null;
	role: UserRole;
}

export function MobileNav({ open, onClose, user, role }: MobileNavProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 bg-background/98 backdrop-blur md:hidden">
			<div className="flex h-14 items-center justify-between px-4">
				<span className="text-xl font-bold text-primary">MicroShort</span>
				<button
					type="button"
					className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground"
					onClick={onClose}
					aria-label="Close menu"
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
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
			<nav className="flex flex-col items-center gap-8 pt-12">
				<Link
					href="/"
					className="text-lg text-foreground transition-colors hover:text-primary"
					onClick={onClose}
				>
					Home
				</Link>
				<Link
					href="/browse"
					className="text-lg text-foreground transition-colors hover:text-primary"
					onClick={onClose}
				>
					Browse
				</Link>
				{user ? (
					<>
						<Link
							href="/profile"
							className="flex items-center gap-2 text-lg text-foreground transition-colors hover:text-primary"
							onClick={onClose}
						>
							<svg
								className="h-5 w-5"
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
								className="text-lg text-foreground transition-colors hover:text-primary"
								onClick={onClose}
							>
								Dashboard
							</Link>
						)}
						{role === "admin" && (
							<Link
								href="/admin"
								className="text-lg text-foreground transition-colors hover:text-primary"
								onClick={onClose}
							>
								Admin
							</Link>
						)}
						<div onClick={onClose}>
							<LogoutButton />
						</div>
					</>
				) : (
					<>
						<Link
							href="/login"
							className="rounded-md bg-primary px-6 py-2 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
							onClick={onClose}
						>
							Sign In
						</Link>
						<Link
							href="/signup"
							className="text-lg text-muted-foreground transition-colors hover:text-primary"
							onClick={onClose}
						>
							Create Account
						</Link>
					</>
				)}
			</nav>
		</div>
	);
}
