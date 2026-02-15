import { withSerwist } from "@serwist/turbopack";

const nextConfig = withSerwist({
	serverExternalPackages: ["esbuild"],
	experimental: {
		authInterrupts: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.supabase.co",
				pathname: "/storage/v1/object/public/**",
			},
		],
	},
});

export default nextConfig;
