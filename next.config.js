/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.alias.canvas = false; // Mantido para o PDF Viewer
        return config;
    },
    // 3. Destrava o limite de tamanho para envios de arquivos
    experimental: {
        serverActions: {
            bodySizeLimit: '20mb',
        },
    },
};

export default nextConfig;