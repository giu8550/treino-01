import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

import { Footer } from "@/components/main/footer";
import { Navbar } from "@/components/main/navbar";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

// --- PROVIDERS ---
import { MovementWalletProvider } from "@/components/providers/MovementWalletProvider";
import AuthProvider from "@/src/providers/SessionProvider";
// ADICIONADO: O provedor de tema que configuramos (assumindo que está em app/providers.tsx)
import { ThemeProvider } from "./providers";

import "../src/i18n";
import "./globals.css";

const StarsCanvas = dynamic(
    () => import("@/components/main/star-background"),
    { ssr: false }
);

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

export const viewport: Viewport = { themeColor: "#030014" };
export const metadata: Metadata = siteConfig;

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        // suppressHydrationWarning é recomendado pelo next-themes para evitar erros no console
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body
            className={cn(
                "relative bg-background text-foreground overflow-x-hidden overflow-y-scroll",
                spaceGrotesk.variable,
                jetbrainsMono.variable,
                "font-sans"
            )}
        >
        {/* 1. ThemeProvider envolve tudo para controlar as cores */}
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            {/* 2. Movement Blockchain Provider */}
            <MovementWalletProvider>
                {/* 3. Session Auth Provider */}
                <AuthProvider>
                    <StarsCanvas />
                    <Navbar />
                    {children}
                    <Footer />
                </AuthProvider>
            </MovementWalletProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}