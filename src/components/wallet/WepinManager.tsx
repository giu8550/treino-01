"use client";

import { useEffect, useState } from "react";
// ✅ IMPORT FROM THE CORRECT OFFICIAL PACKAGES
import { WepinSDK } from "@wepin/sdk-js";
import { WepinProvider } from "@wepin/provider-js";
import { ethers } from "ethers";

// --- CONFIGURATION ---
const VERY_TESTNET_CONFIG = {
    chainId: 4614,
    chainName: "VERY Blockchain Testnet",
    rpcUrls: ["https://rpc-testnet.verylabs.io"],
    nativeCurrency: { name: "VERY", symbol: "VERY", decimals: 18 },
    blockExplorerUrls: ["https://testnet.veryscan.io"],
};

const WEPIN_APP_ID = process.env.NEXT_PUBLIC_WEPIN_APP_ID || "YOUR_APP_ID";
const WEPIN_APP_KEY = process.env.NEXT_PUBLIC_WEPIN_APP_KEY || "YOUR_APP_KEY";

export const useWepin = () => {
    // State to hold the Wepin SDK instance
    const [wepin, setWepin] = useState<WepinSDK | null>(null);
    const [provider, setProvider] = useState<any>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initWepin = async () => {
            try {
                // 1. Initialize the Widget SDK (Controls UI, Login)
                const wepinInstance = new WepinSDK({
                    appId: WEPIN_APP_ID,
                    appKey: WEPIN_APP_KEY,
                });

                await wepinInstance.init();
                setWepin(wepinInstance);
                setIsReady(true);

                // 2. Check if user is already logged in
                const status = await wepinInstance.getStatus();
                if (status === 'login' || status === 'login_before_register') {
                    const accounts = await wepinInstance.getAccounts();
                    if (accounts && accounts.length > 0) {
                        setAccount(accounts[0].address);
                        await setupProvider(wepinInstance); // Setup provider if already logged in
                    }
                }
            } catch (error) {
                console.error("Failed to initialize Wepin:", error);
            }
        };

        if (!wepin) {
            initWepin();
        }
    }, [wepin]);

    // Helper to setup the Blockchain Provider
    const setupProvider = async (wepinInstance: WepinSDK) => {
        try {
            // Initialize the Wepin Provider (Connects to Blockchain)
            // Note: In the new SDK, WepinProvider handles the connection independently but shares the session
            const jsProvider = new WepinProvider({
                appId: WEPIN_APP_ID,
                appKey: WEPIN_APP_KEY,
            });

            await jsProvider.init();

            // Get the EIP-1193 provider for EVM
            // Use 'ethereum' or the specific network string supported by Wepin
            const wepinEvmProvider = await jsProvider.getProvider('ethereum');

            // Wrap with Ethers.js
            const ethersProvider = new ethers.BrowserProvider(wepinEvmProvider as any);
            setProvider(ethersProvider);

            return ethersProvider;
        } catch (e) {
            console.error("Failed to setup provider", e);
        }
    }

    const connect = async () => {
        if (!wepin || !isReady) return;

        try {
            // 1. Open Widget & Login
            await wepin.openWidget();

            // 2. Get Accounts
            const accounts = await wepin.getAccounts();
            if (!accounts || accounts.length === 0) throw new Error("No accounts found");

            const userAccount = accounts[0].address;
            setAccount(userAccount);

            // 3. Setup Provider
            await setupProvider(wepin);

        } catch (error) {
            console.error("Connection failed:", error);
        }
    };

    const logout = async () => {
        if (!wepin) return;
        await wepin.logout();
        setAccount(null);
        setProvider(null);
    };

    return { wepin, provider, account, connect, logout, isReady };
};