import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@ecommaps/client",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecodata.ecommaps.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
