"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";

export const MovementWalletProvider = ({ children }: PropsWithChildren) => {
    return (
        <AptosWalletAdapterProvider
            autoConnect={true}
            dappConfig={{
                network: Network.TESTNET, // A Movement M1 está em Testnet
                aptosConnect: { dappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5" }, // Opcional, para analytics
                mizuwallet: { manifestURL: "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json" } // Opcional
            }}
            onError={(error) => {
                console.log("Erro na carteira:", error);
            }}
        >
            {children}
        </AptosWalletAdapterProvider>
    );
};