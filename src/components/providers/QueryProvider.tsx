import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "../../lib/react-query";
import type { ReactNode } from "react";

type QueryProviderProps = {
  children: ReactNode;
};

const queryClient = createQueryClient();

/**
 * Wraps the application with TanStack Query's QueryClientProvider
 * This enables the use of React Query hooks throughout the component tree
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
