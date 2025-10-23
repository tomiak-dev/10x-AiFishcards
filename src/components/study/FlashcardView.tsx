import { Card, CardContent } from "@/components/ui/card";
import type { ReviewFlashcardDTO } from "../../types";

interface FlashcardViewProps {
  flashcard: ReviewFlashcardDTO;
  isRevealed: boolean;
  onFlip: () => void;
}

/**
 * Displays a flashcard with front and optionally back side
 * Clickable to flip and reveal the answer
 */
export const FlashcardView = ({ flashcard, isRevealed, onFlip }: FlashcardViewProps) => {
  return (
    <button
      type="button"
      className="block w-full max-w-2xl mx-auto cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
      onClick={isRevealed ? undefined : onFlip}
      disabled={isRevealed}
      aria-label={isRevealed ? undefined : "Kliknij lub naciśnij spację aby odwrócić fiszkę"}
      style={{ display: "block" }}
    >
      <div
        className="w-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
          transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front side - Question only, centered */}
        <Card
          className="flip-card-front w-full min-h-[400px] flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            position: isRevealed ? "absolute" : "relative",
            width: "100%",
          }}
        >
          <CardContent className="p-8 w-full">
            <div className="flex items-center justify-center min-h-[300px]">
              <p className="text-2xl text-gray-900 text-center whitespace-pre-wrap">{flashcard.front}</p>
            </div>
          </CardContent>
        </Card>

        {/* Back side - Question on top, answer below */}
        <Card
          className="flip-card-back w-full min-h-[400px]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: isRevealed ? "relative" : "absolute",
            top: 0,
            left: 0,
            width: "100%",
          }}
        >
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <p className="text-lg text-gray-700 whitespace-pre-wrap">{flashcard.front}</p>
              </div>

              <hr className="border-gray-300" />

              <div>
                <p className="text-2xl text-gray-900 whitespace-pre-wrap">{flashcard.back}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </button>
  );
};
