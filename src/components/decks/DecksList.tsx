import type { DeckSummaryDTO } from "../../types";
import { DeckCard } from "./DeckCard";
import { Skeleton } from "@/components/ui/skeleton";

type DecksListProps = {
  decks: DeckSummaryDTO[];
  isLoading: boolean;
  onDelete: (deckId: string) => void;
};

export const DecksList = ({ decks, isLoading, onDelete }: DecksListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} onDelete={onDelete} />
      ))}
    </div>
  );
};
