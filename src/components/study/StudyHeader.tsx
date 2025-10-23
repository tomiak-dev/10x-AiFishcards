import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface StudyHeaderProps {
  deckName: string;
  currentCardIndex: number;
  totalCards: number;
  onEndSession: () => void;
}

/**
 * Displays study session progress information and end session button
 */
export const StudyHeader = ({ deckName, currentCardIndex, totalCards, onEndSession }: StudyHeaderProps) => {
  const progress = totalCards > 0 ? ((currentCardIndex + 1) / totalCards) * 100 : 0;

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deckName}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Fiszka {currentCardIndex + 1} z {totalCards}
          </p>
        </div>
        <Button variant="outline" onClick={onEndSession}>
          Zakończ sesję
        </Button>
      </div>
      <Progress value={progress} className="h-2" aria-label={`Postęp: ${currentCardIndex + 1} z ${totalCards}`} />
    </header>
  );
};
