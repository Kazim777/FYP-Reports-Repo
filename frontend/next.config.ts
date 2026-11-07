import path from "node:path";
import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: { unoptimized: true },
  async rewrites() {
    return backendUrl ? [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }] : [];
  },
};

export default nextConfig;
