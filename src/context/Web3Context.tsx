"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ZAEON_CONFIG } from "src/config/contracts";

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextType>({} as any);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window === 'undefined') return;

    setIsConnecting(true);
    try {
      // --- FORCE METAMASK SELECTION ---
      let ethereumProvider = (window as any).ethereum;
      
      // If multiple wallets are injected (EIP-6963 standard), find MetaMask
      if ((window as any).ethereum?.providers) {
        ethereumProvider = (window as any).ethereum.providers.find((p: any) => p.isMetaMask);
      }

      // If MetaMask is not found at all
      if (!ethereumProvider || !ethereumProvider.isMetaMask) {
         // Fallback check: sometimes it's just window.ethereum
         if (!(window as any).ethereum?.isMetaMask) {
             alert("Please install MetaMask to continue.");
             setIsConnecting(false);
             return;
         }
      }

      // Initialize Ethers with the specific MetaMask provider
      const browserProvider = new ethers.BrowserProvider(ethereumProvider);
      const _signer = await browserProvider.getSigner();
      const _account = await _signer.getAddress();

      // --- CRONOS TESTNET SWITCH ---
      try {
        await ethereumProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ZAEON_CONFIG.CHAIN_ID }],
        });
      } catch (switchError: any) {
        // Error 4902: Chain not added to MetaMask yet
        if (switchError.code === 4902) {
             await ethereumProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: ZAEON_CONFIG.CHAIN_ID,
                    chainName: 'Cronos Testnet',
                    rpcUrls: [ZAEON_CONFIG.RPC_URL],
                    nativeCurrency: { name: 'TCRO', symbol: 'TCRO', decimals: 18 },
                    blockExplorerUrls: ['https://explorer.cronos.org/testnet']
                }]
             });
        }
      }

      setProvider(browserProvider);
      setSigner(_signer);
      setAccount(_account);
      console.log("Connected to MetaMask:", _account);

    } catch (error) {
      console.error("Connection failed", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Auto-connect attempts also need to target MetaMask
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
        // Only try auto-connect if we can verify it's MetaMask or user permitted it
        let eth = (window as any).ethereum;
        if (eth.providers) eth = eth.providers.find((p: any) => p.isMetaMask);
        
        if (eth && eth.isMetaMask) {
            eth.request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) connectWallet();
                });
        }
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, provider, signer, connectWallet, isConnecting }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);