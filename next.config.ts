import { withSerwist } from "@serwist/turbopack";

const nextConfig = withSerwist({
	serverExternalPackages: ["esbuild"],
});

export default nextConfig;
