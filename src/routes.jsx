/* Route registration is file-based via @tanstack/react-router.
   Actual routes live in src/routes/*.jsx and are compiled into
   src/routeTree.gen.js by the router plugin. This file exists
   only to satisfy the conventional "routes.jsx" entry point. */
export { routeTree } from "./routeTree.gen.js";
