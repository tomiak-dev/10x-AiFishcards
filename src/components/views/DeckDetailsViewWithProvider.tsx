import { QueryProvider } from "../providers/QueryProvider";
import { DeckDetailsView } from "./DeckDetailsView";

type DeckDetailsViewWithProviderProps = {
  deckId: string;
};

/**
 * Wrapper component that combines QueryProvider with DeckDetailsView
 * This is necessary for Astro to properly hydrate them as a single island
 */
export const DeckDetailsViewWithProvider = ({ deckId }: DeckDetailsViewWithProviderProps) => {
  return (
    <QueryProvider>
      <DeckDetailsView deckId={deckId} />
    </QueryProvider>
  );
};
