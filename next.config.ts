import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    return ["/", "/privacy", "/terms"].map((source) => ({
      source,
      destination: "/dashboard",
      permanent: false,
    }));
  },
};

export default config;
