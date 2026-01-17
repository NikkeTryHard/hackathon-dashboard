import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only allow specific tunnel origins, not wildcards
  allowedDevOrigins: [
    "https://hackathoncrew.share.zrok.io",
    // Add your specific cloudflare tunnel URL here after it's stable
    // "https://your-specific-tunnel.trycloudflare.com",
  ],

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable strict mode
  reactStrictMode: true,
};

export default nextConfig;
