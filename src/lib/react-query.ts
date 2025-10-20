import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a new QueryClient instance with default configuration
 * Used for TanStack Query (React Query)
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });
};
