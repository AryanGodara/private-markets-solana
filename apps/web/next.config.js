/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  webpack: (config, { isServer }) => {
    // Fixes for Solana and crypto packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        process: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        stream: false,
        os: false,
      };
    }

    // Externalize problematic native modules
    config.externals = config.externals || [];
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'bigint-buffer': 'commonjs bigint-buffer',
      'tiny-secp256k1': 'commonjs tiny-secp256k1',
    });

    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@solana/ },
      { module: /node_modules\/bigint-buffer/ },
    ];

    return config;
  },
  
  transpilePackages: ['@solana/web3.js'],
  
  // Optimize production build
  productionBrowserSourceMaps: false,
  
  // Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;
