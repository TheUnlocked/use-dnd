/** @type {import('next').NextConfig} */
let nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config) => {
        // Note: we provide webpack above so you should not `require` it
        // Perform customizations to webpack config
        // Load source maps in dev mode
        if (config.mode === 'development') {
            config.module.rules.push({
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre',
            });
        }
    
        // Important: return the modified config
        return config;
    },
};

if (process.env.ANALYZE) {
    nextConfig = require('@next/bundle-analyzer')({ enabled: true })(nextConfig);
}

module.exports = nextConfig;
