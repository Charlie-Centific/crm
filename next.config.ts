import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  images: {
    // Avatars are local WebP files served from /public/avatars — no remote domains needed
    unoptimized: false,
  },
};

export default nextConfig;
