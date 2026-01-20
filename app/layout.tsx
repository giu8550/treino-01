import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, JetBrains_Mono, Outfit } from "next/font/google";

import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

// --- PROVIDERS ---
import AuthProvider from "@/src/providers/SessionProvider";
import { ThemeProvider } from "./providers";

import "../src/i18n";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space",
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-code",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    display: "swap",
});

export const viewport: Viewport = { themeColor: "#030014" };
export const metadata: Metadata = siteConfig;

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body
            className={cn(
                "relative bg-white dark:bg-background text-foreground overflow-x-hidden overflow-y-scroll",
                spaceGrotesk.variable,
                jetbrainsMono.variable,
                outfit.variable,
                "font-sans"
            )}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
                <AuthProvider>
                    {/* O conteúdo da página decide quando mostrar Navbar/Background */}
                    {children}
                </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}