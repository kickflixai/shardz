import { withSerwist } from "@serwist/turbopack";

const nextConfig = withSerwist({
	serverExternalPackages: ["esbuild"],
	experimental: {
		authInterrupts: true,
	},
});

export default nextConfig;
