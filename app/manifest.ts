import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MealMate",
    short_name: "MealMate",
    description: "Production-ready student mess management.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#ff5b5b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
