import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow zrok tunnel for dev
  allowedDevOrigins: ["https://hackathoncrew.share.zrok.io"],
};

export default nextConfig;
