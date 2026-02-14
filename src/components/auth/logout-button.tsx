"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
	const router = useRouter();

	async function handleLogout() {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push("/");
		router.refresh();
	}

	return (
		<button
			type="button"
			onClick={handleLogout}
			className="text-sm text-muted-foreground transition-colors hover:text-primary"
		>
			Sign Out
		</button>
	);
}
