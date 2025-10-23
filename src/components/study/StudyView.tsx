import { useCallback, useState, useEffect } from "react";
import { useStudySession } from "../hooks/useStudySession";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { StudyHeader } from "./StudyHeader";
import { FlashcardView } from "./FlashcardView";
import { StudyControls } from "./StudyControls";
import { SessionSummaryModal } from "./SessionSummaryModal";
import { EmptyState } from "./EmptyState";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";
import { KeyboardHints } from "./KeyboardHints";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StudyViewProps {
  deckId: string;
  deckName: string;
}

/**
 * Main component for study session view
 * Orchestrates the entire study session flow
 */
export const StudyView = ({ deckId, deckName }: StudyViewProps) => {
  const { state, currentFlashcard, revealAnswer, submitReview, restartSession, isSubmitting, refetch } =
    useStudySession({ deckId });

  const [showEndConfirm, setShowEndConfirm] = useState(false);

  /**
   * Handles revealing the answer
   */
  const handleReveal = useCallback(() => {
    revealAnswer();
  }, [revealAnswer]);

  /**
   * Focus management - move focus to first rating button after reveal
   */
  useEffect(() => {
    if (state.isRevealed && state.status === "ready") {
      // Small delay to allow DOM update
      setTimeout(() => {
        const firstRatingButton = document.querySelector('[aria-label="Ocena: Nie wiem"]') as HTMLButtonElement;
        if (firstRatingButton) {
          firstRatingButton.focus();
        }
      }, 100);
    }
  }, [state.isRevealed, state.status]);

  /**
   * Handles rating a flashcard
   */
  const handleRate = useCallback(
    async (quality: "again" | "good" | "easy") => {
      try {
        await submitReview(quality);
      } catch (error) {
        toast.error("Nie udało się zapisać oceny. Spróbuj ponownie.");
        console.error("Failed to submit review:", error);
      }
    },
    [submitReview]
  );

  /**
   * Handles end session button click
   */
  const handleEndSessionClick = useCallback(() => {
    setShowEndConfirm(true);
  }, []);

  /**
   * Confirms ending the session
   */
  const handleConfirmEndSession = useCallback(() => {
    setShowEndConfirm(false);
    window.location.href = `/decks/${deckId}`;
  }, [deckId]);

  /**
   * Cancels ending the session
   */
  const handleCancelEndSession = useCallback(() => {
    setShowEndConfirm(false);
  }, []);

  /**
   * Handles closing the summary modal
   */
  const handleCloseSummary = useCallback(() => {
    window.location.href = `/decks/${deckId}`;
  }, [deckId]);

  /**
   * Handles restarting the session
   */
  const handleRestartSession = useCallback(() => {
    restartSession();
  }, [restartSession]);

  /**
   * Handles returning from empty state
   */
  const handleReturn = useCallback(() => {
    window.location.href = `/decks/${deckId}`;
  }, [deckId]);

  /**
   * Handles retry after error
   */
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onReveal: !state.isRevealed && state.status === "ready" ? handleReveal : undefined,
    onRateAgain: state.isRevealed && state.status === "ready" && !isSubmitting ? () => handleRate("again") : undefined,
    onRateGood: state.isRevealed && state.status === "ready" && !isSubmitting ? () => handleRate("good") : undefined,
    onRateEasy: state.isRevealed && state.status === "ready" && !isSubmitting ? () => handleRate("easy") : undefined,
    enabled: state.status === "ready" && !showEndConfirm,
  });

  // Render loading state
  if (state.status === "loading") {
    return <LoadingSpinner />;
  }

  // Render error state
  if (state.status === "error") {
    return <ErrorDisplay onRetry={handleRetry} />;
  }

  // Render empty state
  if (state.status === "empty") {
    return <EmptyState onReturn={handleReturn} />;
  }

  // Render active session
  if (state.status === "ready" && currentFlashcard) {
    return (
      <>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <StudyHeader
            deckName={deckName}
            currentCardIndex={state.currentCardIndex}
            totalCards={state.flashcards.length}
            onEndSession={handleEndSessionClick}
          />

          <div className="mb-8">
            <FlashcardView flashcard={currentFlashcard} isRevealed={state.isRevealed} />
          </div>

          <StudyControls
            isRevealed={state.isRevealed}
            onReveal={handleReveal}
            onRate={handleRate}
            isSubmitting={isSubmitting}
          />

          <KeyboardHints isRevealed={state.isRevealed} />
        </div>

        {/* End session confirmation dialog */}
        <Dialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Zakończyć sesję?</DialogTitle>
              <DialogDescription>
                Czy na pewno chcesz zakończyć sesję nauki? Twój postęp zostanie zapisany.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelEndSession}>
                Anuluj
              </Button>
              <Button onClick={handleConfirmEndSession}>Zakończ sesję</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Render finished state with modal (always render with a container)
  if (state.status === "finished") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <SessionSummaryModal
          isOpen={true}
          stats={state.stats}
          onClose={handleCloseSummary}
          onRestart={handleRestartSession}
        />
      </div>
    );
  }

  // Fallback (should not reach here)
  return <LoadingSpinner />;
};
