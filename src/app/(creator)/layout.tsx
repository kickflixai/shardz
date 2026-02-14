import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export default function CreatorLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen">
			<Sidebar variant="creator" />
			<main className="flex-1 p-4 lg:ml-64">{children}</main>
		</div>
	);
}
