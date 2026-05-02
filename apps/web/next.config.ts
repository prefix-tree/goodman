import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API requests to Hono backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:3001"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
