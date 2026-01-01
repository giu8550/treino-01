import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

import { Footer } from "@/components/main/footer";
import { Navbar } from "@/components/main/navbar";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";
// ClientShell REMOVIDO para evitar erro 'undefined'
import { Web3Provider } from "./providers";
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
        <html lang="en" className="scroll-smooth">
        <body
            className={cn(
                // MUDANÇA CRÍTICA: bg-background e text-foreground (variáveis) em vez de cor fixa
                "relative bg-background text-foreground overflow-x-hidden overflow-y-scroll",
                spaceGrotesk.variable,
                jetbrainsMono.variable,
                "font-sans"
            )}
        >
        <Web3Provider>
            {/* Componentes diretos, sem ClientShell */}
            <StarsCanvas />
            <Navbar />
            {children}
            <Footer />
        </Web3Provider>
        </body>
        </html>
    );
}