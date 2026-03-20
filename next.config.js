const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  serverExternalPackages: ["mongoose", "ioredis", "bullmq"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};
module.exports = nextConfig;
