import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen">
			<Sidebar variant="admin" />
			<main className="flex-1 p-4 lg:ml-64">{children}</main>
		</div>
	);
}
