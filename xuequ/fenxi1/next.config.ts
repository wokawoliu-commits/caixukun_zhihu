import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.STATIC_SITE_EXPORT === "1"
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
