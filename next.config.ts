import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow tunnels for dev
  allowedDevOrigins: ["https://hackathoncrew.share.zrok.io", "*.trycloudflare.com"],
};

export default nextConfig;
