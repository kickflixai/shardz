import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SerwistProvider } from "@/components/providers/serwist-provider";
import { DemoRoleProvider } from "@/components/providers/demo-role-provider";
import { DemoRoleSwitcher } from "@/components/layout/demo-role-switcher";
import "./globals.css";

const APP_NAME = "Shardz";
const APP_DESCRIPTION = "Premium short-form video series";

export const metadata: Metadata = {
	applicationName: APP_NAME,
	title: {
		default: APP_NAME,
		template: `%s | ${APP_NAME}`,
	},
	description: APP_DESCRIPTION,
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: APP_NAME,
	},
	formatDetection: {
		telephone: false,
	},
};

export const viewport: Viewport = {
	themeColor: "#141414",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" dir="ltr" suppressHydrationWarning>
			<head />
			<body className="min-h-screen bg-background text-foreground antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>
					<SerwistProvider swUrl="/serwist/sw.js">
						<DemoRoleProvider>
							<NuqsAdapter>
								{children}
								<DemoRoleSwitcher />
								<Toaster
									theme="dark"
									richColors
									position="bottom-center"
								/>
							</NuqsAdapter>
						</DemoRoleProvider>
					</SerwistProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
