import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/s3-images/:path*',
        destination: 'https://ebackend.s3.eu-north-1.amazonaws.com/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/users',
        permanent: true, 
      },
    ]
  },
};

export default nextConfig;
