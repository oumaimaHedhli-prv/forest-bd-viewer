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
        destination: 'http://localhost:4000/api/:path*'
      },
      {
        source: '/graphql',
        destination: 'http://localhost:4000/graphql'
      }
    ];
  }
};

export default nextConfig;
