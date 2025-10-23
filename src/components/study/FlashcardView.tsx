import { Card, CardContent } from "@/components/ui/card";
import type { ReviewFlashcardDTO } from "../../types";

interface FlashcardViewProps {
  flashcard: ReviewFlashcardDTO;
  isRevealed: boolean;
}

/**
 * Displays a flashcard with front and optionally back side
 */
export const FlashcardView = ({ flashcard, isRevealed }: FlashcardViewProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Przód</h2>
            <p className="text-xl text-gray-900 whitespace-pre-wrap">{flashcard.front}</p>
          </div>

          {isRevealed && (
            <>
              <hr className="border-gray-200" />
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-2">Tył</h2>
                <p className="text-xl text-gray-900 whitespace-pre-wrap">{flashcard.back}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
