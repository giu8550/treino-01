'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { config } from '@/app/config/wagmi';

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    {children}
                </NextThemesProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}