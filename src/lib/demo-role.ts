import { cookies } from "next/headers";

type UserRole = "viewer" | "creator" | "admin";

const DEMO_ROLE_COOKIE = "x-demo-role";

const ROLE_HIERARCHY: Record<UserRole, number> = {
	viewer: 0,
	creator: 1,
	admin: 2,
};

/**
 * Server-side: reads the demo role cookie and returns the effective role.
 * Only allows downgrade (admin can appear as creator/viewer, creator can appear as viewer).
 * Returns actualRole if no override or invalid override.
 */
export async function getEffectiveRole(actualRole: UserRole): Promise<UserRole> {
	const cookieStore = await cookies();
	const demoRole = cookieStore.get(DEMO_ROLE_COOKIE)?.value as UserRole | undefined;

	if (!demoRole || !ROLE_HIERARCHY[demoRole]) {
		return actualRole;
	}

	// Only allow downgrade — demo role must be lower than actual role
	if (ROLE_HIERARCHY[demoRole] < ROLE_HIERARCHY[actualRole]) {
		return demoRole;
	}

	return actualRole;
}
