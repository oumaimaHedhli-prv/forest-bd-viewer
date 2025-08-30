import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      },
      {
        source: '/graphql',
        destination: 'http://localhost:3001/graphql'
      }
    ];
  }
};

export default nextConfig;
