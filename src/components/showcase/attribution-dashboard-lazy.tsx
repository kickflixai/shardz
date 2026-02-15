"use client";

import dynamic from "next/dynamic";

const AttributionDashboard = dynamic(
	() =>
		import("@/components/showcase/attribution-dashboard").then((mod) => ({
			default: mod.AttributionDashboard,
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

export function AttributionDashboardLazy() {
	return <AttributionDashboard />;
}
