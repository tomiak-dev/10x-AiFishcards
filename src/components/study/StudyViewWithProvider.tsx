import { QueryProvider } from "../providers/QueryProvider";
import { StudyView } from "./StudyView";

interface StudyViewWithProviderProps {
  deckId: string;
  deckName: string;
}

/**
 * Wrapper component that combines QueryProvider with StudyView
 * This is necessary for Astro to properly hydrate them as a single island
 */
export const StudyViewWithProvider = ({ deckId, deckName }: StudyViewWithProviderProps) => {
  return (
    <QueryProvider>
      <StudyView deckId={deckId} deckName={deckName} />
    </QueryProvider>
  );
};
