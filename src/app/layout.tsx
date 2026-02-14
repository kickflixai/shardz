import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SerwistProvider } from "@/components/providers/serwist-provider";
import "./globals.css";

const APP_NAME = "MicroShort";
const APP_DESCRIPTION = "Premium microshort video series";

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
						{children}
					</SerwistProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
