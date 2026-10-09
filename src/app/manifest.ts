import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "LifeOS",
    short_name: "LifeOS",
    description: "Your personal space for life and creative work.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f4f5f2",
    theme_color: "#f4f5f2",
    icons: [
      { src: "/icons/lifeos-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/lifeos-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/lifeos-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
