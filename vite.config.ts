import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  server: {
    // Dev-only: allow Cloudflare Quick Tunnels (subdomains of trycloudflare.com)
    // in addition to localhost. Required so `cloudflared tunnel --url http://localhost:5173`
    // serves the dev server without Vite rejecting the tunnel hostname.
    allowedHosts: [".trycloudflare.com"],
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      start: { entry: "server" },
    }),
    react(),
  ],
});
