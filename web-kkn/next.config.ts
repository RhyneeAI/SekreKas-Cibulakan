import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, ".."),
  async redirects() {
    return [{ source: "/", destination: "/absen", permanent: false }];
  },
};

export default nextConfig;
