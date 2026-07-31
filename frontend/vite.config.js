import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      port: 3000,      // Change to your desired port
      strictPort: true // Optional: fail instead of picking another port
    },
  },

  tanstackStart: {
    server: {
      entry: "server",
    },
    router: {
      generatedRouteTree: "./src/routeTree.gen.js",
      disableTypes: true,
    },
  },
});