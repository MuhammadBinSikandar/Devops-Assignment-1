/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce build warnings and optimize performance
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  
  // Configure webpack to handle large assets better and reduce serialization warnings
  webpack: (config, { isServer, dev }) => {
    // Optimize for production builds to reduce serialization warnings
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate large vendor libraries to reduce bundle size
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 300000, // 300KB chunks
          },
        },
      };
    }
    
    return config;
  },
  
  // Handle static assets better
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
