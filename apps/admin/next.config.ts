import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    API_BASE_URL: process.env.API_BASE_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd11a0m43ek7ap8.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'd2tmwt8yl5m7qh.cloudfront.net',
      },
    ],
  },
};

export default nextConfig;
