"use client";

import dynamic from "next/dynamic";

const AdDashboard = dynamic(
	() =>
		import("@/components/showcase/ad-dashboard").then((mod) => ({
			default: mod.AdDashboard,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-96 items-center justify-center rounded-2xl border border-cinema-border bg-cinema-dark">
				<div className="text-sm text-cinema-muted">
					Loading dashboard...
				</div>
			</div>
		),
	},
);

export function AdDashboardLazy() {
	return <AdDashboard />;
}
