import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,      // cache data for 30s — prevents re-fetch on every nav
        gcTime: 5 * 60_000,     // keep unused data in memory for 5 min
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 30_000,  // don't re-fetch preloaded routes for 30s
  });

  return router;
};
