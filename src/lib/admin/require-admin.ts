import { forbidden, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?next=/admin");
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select("role, display_name")
		.eq("id", user.id)
		.single();

	if (!profile || profile.role !== "admin") {
		forbidden();
	}

	return { user, profile: profile!, supabase };
}
