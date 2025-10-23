import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ReviewFlashcardsDTO,
  ReviewFlashcardDTO,
  SubmitReviewCommand,
  ReviewResponseDTO,
  StudySessionState,
  ReviewQualityEnum,
  SessionStats,
} from "../../types";

const SESSION_STORAGE_KEY = "study_session_state";

/**
 * Fetches flashcards due for review from the API
 */
const fetchReviewFlashcards = async (deckId: string): Promise<ReviewFlashcardsDTO> => {
  const response = await fetch(`/api/decks/${deckId}/review`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch flashcards for review");
  }

  return response.json();
};

/**
 * Submits a flashcard review to the API
 */
const submitReviewRequest = async (command: SubmitReviewCommand): Promise<ReviewResponseDTO> => {
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to submit review");
  }

  return response.json();
};

/**
 * Initializes or retrieves session state from sessionStorage
 */
const initializeSessionState = (deckId: string, flashcards: ReviewFlashcardDTO[]): StudySessionState => {
  try {
    const stored = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_${deckId}`);
    if (stored) {
      const parsed = JSON.parse(stored) as StudySessionState;
      // Validate that stored flashcards match current flashcards
      if (parsed.flashcards.length === flashcards.length) {
        return { ...parsed, status: "ready" };
      }
    }
  } catch (error) {
    console.error("Failed to restore session state:", error);
  }

  // Return fresh state
  return {
    status: flashcards.length > 0 ? "ready" : "empty",
    flashcards,
    currentCardIndex: 0,
    isRevealed: false,
    stats: {
      total: flashcards.length,
      again: 0,
      good: 0,
      easy: 0,
    },
  };
};

/**
 * Saves session state to sessionStorage
 */
const saveSessionState = (deckId: string, state: StudySessionState): void => {
  try {
    sessionStorage.setItem(`${SESSION_STORAGE_KEY}_${deckId}`, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save session state:", error);
  }
};

/**
 * Clears session state from sessionStorage
 */
const clearSessionState = (deckId: string): void => {
  try {
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_${deckId}`);
  } catch (error) {
    console.error("Failed to clear session state:", error);
  }
};

interface UseStudySessionParams {
  deckId: string;
}

/**
 * Custom hook for managing study session state
 * Encapsulates logic for fetching flashcards, managing session state, and submitting reviews
 */
export const useStudySession = ({ deckId }: UseStudySessionParams) => {
  const queryClient = useQueryClient();

  // Fetch flashcards for review
  const {
    data: reviewData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["review", deckId],
    queryFn: () => fetchReviewFlashcards(deckId),
    enabled: !!deckId,
    retry: 1,
  });

  // Initialize session state
  const [state, setState] = useState<StudySessionState>({
    status: "loading",
    flashcards: [],
    currentCardIndex: 0,
    isRevealed: false,
    stats: {
      total: 0,
      again: 0,
      good: 0,
      easy: 0,
    },
  });

  // Track if session has been initialized to prevent resets
  const [isInitialized, setIsInitialized] = useState(false);

  // Submit review mutation
  const submitMutation = useMutation({
    mutationFn: submitReviewRequest,
    // Don't invalidate during session - only on restart
  });

  // Initialize state when data is loaded (only once per session)
  useEffect(() => {
    if (isLoading) {
      setState((prev) => ({ ...prev, status: "loading" }));
      return;
    }

    if (error) {
      setState((prev) => ({ ...prev, status: "error" }));
      setIsInitialized(true);
      return;
    }

    if (reviewData && !isInitialized) {
      const initialState = initializeSessionState(deckId, reviewData.flashcards);
      setState(initialState);
      setIsInitialized(true);
    }
  }, [deckId, reviewData, isLoading, error, isInitialized]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (state.status === "ready") {
      saveSessionState(deckId, state);
    }
  }, [deckId, state]);

  /**
   * Reveals the answer for the current flashcard
   */
  const revealAnswer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRevealed: true,
    }));
  }, []);

  /**
   * Submits a review for the current flashcard
   */
  const submitReview = useCallback(
    async (quality: ReviewQualityEnum) => {
      const currentFlashcard = state.flashcards[state.currentCardIndex];
      if (!currentFlashcard) return;

      try {
        await submitMutation.mutateAsync({
          flashcard_id: currentFlashcard.id,
          quality,
        });

        // Update stats
        const updatedStats: SessionStats = {
          ...state.stats,
          [quality]: state.stats[quality] + 1,
        };

        // Move to next flashcard or finish
        const isLastCard = state.currentCardIndex === state.flashcards.length - 1;

        if (isLastCard) {
          setState((prev) => ({
            ...prev,
            stats: updatedStats,
            status: "finished",
          }));
          clearSessionState(deckId);
        } else {
          setState((prev) => ({
            ...prev,
            currentCardIndex: prev.currentCardIndex + 1,
            isRevealed: false,
            stats: updatedStats,
          }));
        }
      } catch (error) {
        console.error("Failed to submit review:", error);
        throw error;
      }
    },
    [deckId, state.flashcards, state.currentCardIndex, state.stats, submitMutation]
  );

  /**
   * Ends the session and clears state
   */
  const endSession = useCallback(() => {
    clearSessionState(deckId);
    setState((prev) => ({
      ...prev,
      status: "finished",
    }));
  }, [deckId]);

  /**
   * Restarts the session by refetching flashcards
   */
  const restartSession = useCallback(() => {
    clearSessionState(deckId);
    setIsInitialized(false);
    setState({
      status: "loading",
      flashcards: [],
      currentCardIndex: 0,
      isRevealed: false,
      stats: {
        total: 0,
        again: 0,
        good: 0,
        easy: 0,
      },
    });
    // Invalidate and refetch to get fresh flashcard list
    queryClient.invalidateQueries({ queryKey: ["review", deckId] });
    refetch();
  }, [deckId, refetch, queryClient]);

  return {
    state,
    currentFlashcard: state.flashcards[state.currentCardIndex],
    revealAnswer,
    submitReview,
    endSession,
    restartSession,
    isLoading,
    isSubmitting: submitMutation.isPending,
    error,
    refetch,
  };
};
