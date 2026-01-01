import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';
import { injected } from 'wagmi/connectors';

// Definindo a Very Network
export const veryMainnet = defineChain({
    id: 4613,
    name: 'Very Mainnet',
    nativeCurrency: { name: 'Very', symbol: 'VERY', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.verylabs.io'] },
    },
    blockExplorers: {
        default: { name: 'VeryScan', url: 'https://veryscan.io' },
    },
});

// Lista inicial apenas com conectores seguros (MetaMask/Injected)
const connectors = [
    injected(),
];

// SEGURANÇA MÁXIMA: Só carrega o Wepin se estiver no navegador
// E usa 'require' dinâmico para evitar que o import quebre o servidor
if (typeof window !== 'undefined') {
    try {
        // Importação dinâmica para evitar erro "window is not defined" no build
        const { wepinWallet } = require('@wepin/wagmi-connector');

        connectors.push(
            wepinWallet({
                appId: 'da2844c58339e33604cdfa0a5a4f3334',
                appKey: 'ak_live_GCTTXin6TN5WkkvaOWYZ9PWnjPxBaSLI8pLg0MkZhiG'
            })
        );
    } catch (error) {
        console.warn("Falha ao carregar conector Wepin:", error);
    }
}

export const config = createConfig({
    chains: [veryMainnet, sepolia],
    connectors: connectors,
    transports: {
        [veryMainnet.id]: http(),
        [sepolia.id]: http(),
    },
    ssr: true,
});