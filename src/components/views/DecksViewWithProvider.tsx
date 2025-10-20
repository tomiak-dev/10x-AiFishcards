import { QueryProvider } from "../providers/QueryProvider";
import { DecksView } from "./DecksView";

/**
 * Wrapper component that combines QueryProvider with DecksView
 * This is necessary for Astro to properly hydrate them as a single island
 */
export const DecksViewWithProvider = () => {
  return (
    <QueryProvider>
      <DecksView />
    </QueryProvider>
  );
};
