"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDemoRole } from "@/components/providers/demo-role-provider";

type UserRole = "viewer" | "creator" | "admin";

const roles: { value: UserRole; label: string }[] = [
	{ value: "admin", label: "Admin" },
	{ value: "creator", label: "Creator" },
	{ value: "viewer", label: "Viewer" },
];

export function DemoRoleSwitcher() {
	const { demoRole, setDemoRole } = useDemoRole();
	const [expanded, setExpanded] = useState(false);
	const [actualRole, setActualRole] = useState<UserRole | null>(null);

	useEffect(() => {
		const supabase = createClient();

		const fetchRole = (userId: string) => {
			supabase
				.from("profiles")
				.select("role")
				.eq("id", userId)
				.single()
				.then(({ data: profile }) => {
					if (profile?.role) {
						setActualRole(profile.role as UserRole);
					}
				});
		};

		// Check current user
		supabase.auth.getUser().then(({ data }) => {
			if (data.user) fetchRole(data.user.id);
		});

		// Listen for auth changes (login/logout)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				fetchRole(session.user.id);
			} else {
				setActualRole(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	// Only show for admins
	if (actualRole !== "admin") return null;

	const isOverriding = demoRole !== null;
	const currentLabel = demoRole
		? roles.find((r) => r.value === demoRole)?.label
		: "Admin";

	return (
		<div className="fixed bottom-4 right-4 z-50">
			{expanded ? (
				<div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-cinema-black/95 p-2 shadow-2xl backdrop-blur">
					<div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-cinema-muted">
						Demo Role
					</div>
					{roles.map((role) => {
						const isActive =
							(demoRole === null && role.value === "admin") ||
							demoRole === role.value;
						return (
							<button
								key={role.value}
								type="button"
								onClick={() => {
									setDemoRole(
										role.value === "admin" ? null : role.value,
									);
									setExpanded(false);
								}}
								className={`rounded-lg px-4 py-1.5 text-left text-sm font-medium transition-colors ${
									isActive
										? "bg-brand-yellow text-cinema-black"
										: "text-white/70 hover:bg-white/10 hover:text-white"
								}`}
							>
								{role.label}
							</button>
						);
					})}
				</div>
			) : (
				<button
					type="button"
					onClick={() => setExpanded(true)}
					className="flex items-center gap-2 rounded-full border border-white/10 bg-cinema-black/95 px-4 py-2 text-sm font-medium text-white/80 shadow-2xl backdrop-blur transition-colors hover:border-white/20 hover:text-white"
				>
					{isOverriding && (
						<span className="h-2 w-2 rounded-full bg-brand-yellow" />
					)}
					{currentLabel}
				</button>
			)}
		</div>
	);
}
