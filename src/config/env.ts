const requiredEnvVars = [
	"NEXT_PUBLIC_SUPABASE_URL",
	"NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

function getEnvVar(name: EnvVar): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export const env = {
	supabase: {
		url: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
		publishableKey: getEnvVar("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
	},
} as const;
