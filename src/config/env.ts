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

// Server-only Mux env vars (not NEXT_PUBLIC_)
const serverEnvVars = [
	"MUX_TOKEN_ID",
	"MUX_TOKEN_SECRET",
	"MUX_SIGNING_KEY",
	"MUX_PRIVATE_KEY",
	"MUX_WEBHOOK_SECRET",
] as const;

type ServerEnvVar = (typeof serverEnvVars)[number];

function getServerEnvVar(name: ServerEnvVar): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required server environment variable: ${name}`);
	}
	return value;
}

/**
 * Decode a base64-encoded environment variable value.
 * MUX_PRIVATE_KEY is stored base64-encoded in .env.local for portability.
 */
function getBase64EnvVar(name: ServerEnvVar): string {
	const value = getServerEnvVar(name);
	return Buffer.from(value, "base64").toString("utf-8");
}

export const env = {
	app: {
		url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	},
	supabase: {
		url: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
		publishableKey: getEnvVar("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
	},
	mux: {
		tokenId: getServerEnvVar("MUX_TOKEN_ID"),
		tokenSecret: getServerEnvVar("MUX_TOKEN_SECRET"),
		signingKey: getServerEnvVar("MUX_SIGNING_KEY"),
		privateKey: getBase64EnvVar("MUX_PRIVATE_KEY"),
		webhookSecret: getServerEnvVar("MUX_WEBHOOK_SECRET"),
	},
} as const;
