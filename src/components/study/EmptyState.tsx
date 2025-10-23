import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";

interface EmptyStateProps {
  onReturn: () => void;
}

/**
 * Displayed when there are no flashcards to review
 */
export function EmptyState({ onReturn }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 text-center">
      {/* Ikona celebration */}
      <PartyPopper className="h-16 w-16 text-primary" />

      {/* Nagłówek */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Świetna robota!</h2>
        <p className="text-muted-foreground">Nie masz fiszek do powtórki. Wróć później lub przeglądaj inne talie.</p>
      </div>

      {/* Przycisk powrotu */}
      <Button onClick={onReturn} size="lg">
        Wróć do listy talii
      </Button>
    </div>
  );
}
