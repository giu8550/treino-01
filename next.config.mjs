/** @type {import('next').NextConfig} */
const nextConfig = {
    // 1. Autorização de domínios externos para o componente <Image />
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com', // Avatares do Google
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'authjs.dev', // Ícones de provedores de login
                port: '',
                pathname: '/**',
            },
        ],
    },

    // 2. Configurações anteriores de Build e PDF
    webpack: (config) => {
        // Ignora o módulo 'canvas' que causa erro no build do PDF Viewer
        config.resolve.alias.canvas = false;
        return config;
    },

    // 3. Destrava o limite de tamanho para envios de arquivos Base64 (Zenita)
    experimental: {
        serverActions: {
            bodySizeLimit: '20mb',
        },
    },
};

export default nextConfig;