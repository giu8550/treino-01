/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        // Isso ignora o módulo 'canvas' que causa o erro de build
        config.resolve.alias.canvas = false;
        return config;
    },
    // ... suas outras configurações
};

export default nextConfig;