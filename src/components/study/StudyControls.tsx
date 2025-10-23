import { Button } from "@/components/ui/button";
import type { ReviewQualityEnum } from "../../types";

interface StudyControlsProps {
  isRevealed: boolean;
  onReveal: () => void;
  onRate: (quality: ReviewQualityEnum) => void;
  isSubmitting: boolean;
}

/**
 * Control buttons for study session - rate flashcard
 * No reveal button - flashcard is clickable to flip
 */
export const StudyControls = ({ isRevealed, onReveal, onRate, isSubmitting }: StudyControlsProps) => {
  // Don't show any controls until flashcard is revealed
  if (!isRevealed) {
    return null;
  }

  return (
    <div className="flex justify-center gap-4 mt-8">
      <Button
        size="lg"
        variant="destructive"
        onClick={() => onRate("again")}
        disabled={isSubmitting}
        className="min-w-[140px]"
        aria-label="Ocena: Nie wiem"
      >
        Nie wiem
      </Button>
      <Button
        size="lg"
        variant="default"
        onClick={() => onRate("good")}
        disabled={isSubmitting}
        className="min-w-[140px]"
        aria-label="Ocena: Wiem"
      >
        Wiem
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => onRate("easy")}
        disabled={isSubmitting}
        className="min-w-[140px]"
        aria-label="Ocena: Bardzo łatwe"
      >
        Bardzo łatwe
      </Button>
    </div>
  );
};
