type UserRole = "viewer" | "creator" | "admin";

const DEMO_ROLE_COOKIE = "x-demo-role";

export function getDemoRoleCookie(): UserRole | null {
	if (typeof document === "undefined") return null;

	const match = document.cookie
		.split("; ")
		.find((row) => row.startsWith(`${DEMO_ROLE_COOKIE}=`));

	if (!match) return null;

	const value = match.split("=")[1] as UserRole;
	if (value === "viewer" || value === "creator" || value === "admin") {
		return value;
	}

	return null;
}

export function setDemoRoleCookie(role: UserRole | null): void {
	if (typeof document === "undefined") return;

	if (role === null) {
		// Clear the cookie
		document.cookie = `${DEMO_ROLE_COOKIE}=; path=/; max-age=0`;
	} else {
		// Set cookie for 24 hours
		document.cookie = `${DEMO_ROLE_COOKIE}=${role}; path=/; max-age=86400; SameSite=Lax`;
	}
}
