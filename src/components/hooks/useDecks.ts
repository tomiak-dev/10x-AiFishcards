import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ListDecksResponse,
  DeckDetailsDTO,
  UpdateDeckCommand,
  AddFlashcardCommand,
  UpdateFlashcardCommand,
} from "../../types";

interface UseDecksParams {
  page?: number;
  limit?: number;
  sortBy?: "name" | "created_at" | "last_reviewed_at";
  order?: "asc" | "desc";
}

/**
 * Fetches the list of decks from the API
 */
const fetchDecks = async (params: UseDecksParams): Promise<ListDecksResponse> => {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
    sortBy: params.sortBy ?? "created_at",
    order: params.order ?? "desc",
  });

  const response = await fetch(`/api/decks?${searchParams.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch decks");
  }

  return response.json();
};

/**
 * Deletes a deck by ID
 */
const deleteDeck = async (deckId: string): Promise<void> => {
  const response = await fetch(`/api/decks/${deckId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete deck");
  }
};

/**
 * Custom hook for fetching and managing decks
 * Uses TanStack Query for caching and state management
 */
export const useDecks = (params: UseDecksParams = {}) => {
  return useQuery({
    queryKey: ["decks", params],
    queryFn: () => fetchDecks(params),
  });
};

/**
 * Custom hook for deleting a deck
 * Invalidates the decks query after successful deletion
 */
export const useDeleteDeck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDeck,
    onSuccess: () => {
      // Invalidate and refetch decks query
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

/**
 * Fetches detailed information about a specific deck including flashcards
 */
const fetchDeckDetails = async (deckId: string): Promise<DeckDetailsDTO> => {
  const response = await fetch(`/api/decks/${deckId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch deck details");
  }

  return response.json();
};

/**
 * Updates a deck's name
 */
const updateDeck = async (params: { deckId: string; data: UpdateDeckCommand }): Promise<void> => {
  const response = await fetch(`/api/decks/${params.deckId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update deck");
  }
};

/**
 * Adds a new flashcard to a deck
 */
const addFlashcard = async (params: { deckId: string; data: AddFlashcardCommand }): Promise<void> => {
  const response = await fetch(`/api/decks/${params.deckId}/flashcards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to add flashcard");
  }
};

/**
 * Updates an existing flashcard
 */
const updateFlashcard = async (params: { flashcardId: string; data: UpdateFlashcardCommand }): Promise<void> => {
  const response = await fetch(`/api/flashcards/${params.flashcardId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update flashcard");
  }
};

/**
 * Deletes a flashcard
 */
const deleteFlashcard = async (flashcardId: string): Promise<void> => {
  const response = await fetch(`/api/flashcards/${flashcardId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete flashcard");
  }
};

/**
 * Custom hook for fetching deck details
 * Uses TanStack Query for caching and state management
 */
export const useDeckDetails = (deckId: string) => {
  return useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => fetchDeckDetails(deckId),
    enabled: !!deckId,
  });
};

/**
 * Custom hook for updating a deck's name
 * Invalidates the deck details query after successful update
 */
export const useUpdateDeck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDeck,
    onSuccess: (_, variables) => {
      // Invalidate and refetch deck details
      queryClient.invalidateQueries({ queryKey: ["deck", variables.deckId] });
      // Also invalidate decks list
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

/**
 * Custom hook for adding a flashcard to a deck
 * Invalidates the deck details query after successful addition
 */
export const useAddFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFlashcard,
    onSuccess: (_, variables) => {
      // Invalidate and refetch deck details to show new flashcard
      queryClient.invalidateQueries({ queryKey: ["deck", variables.deckId] });
    },
  });
};

/**
 * Custom hook for updating a flashcard
 * Invalidates the deck details query after successful update
 */
export const useUpdateFlashcard = (deckId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFlashcard,
    onSuccess: () => {
      // Invalidate and refetch deck details to show updated flashcard
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
    },
  });
};

/**
 * Custom hook for deleting a flashcard
 * Invalidates the deck details query after successful deletion
 */
export const useDeleteFlashcard = (deckId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFlashcard,
    onSuccess: () => {
      // Invalidate and refetch deck details to reflect deletion
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
    },
  });
};
