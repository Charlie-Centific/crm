import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  images: {
    // Avatars are local WebP files served from /public/avatars — no remote domains needed
    unoptimized: false,
  },
};

export default withNextIntl(nextConfig);
