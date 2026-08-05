// import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// export default defineConfig({
//   vite: {
//     server: {
//       port: 3000,      // Change to your desired port
//       strictPort: true // Optional: fail instead of picking another port
//     },
//   },

//   tanstackStart: {
//     server: {
//       entry: "server",
//     },
//     router: {
//       generatedRouteTree: "./src/routeTree.gen.js",
//       disableTypes: true,
//     },
//   },
// });

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      port: 3000,      // Frontend will run on port 3000
      strictPort: true // Fail if port 3000 is unavailable
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

  define: {
    // Define environment variables for the frontend
    "process.env.API_BASE_URL": JSON.stringify(
      process.env.API_BASE_URL || "https://onecampus-8qm6.onrender.com/api"
    ),
    global: "globalThis",
  },
});