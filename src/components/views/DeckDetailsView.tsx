import { useState, useCallback } from "react";
import {
  useDeckDetails,
  useUpdateDeck,
  useAddFlashcard,
  useUpdateFlashcard,
  useDeleteFlashcard,
} from "../hooks/useDecks";
import { DeckHeader } from "../decks/DeckHeader";
import { AddFlashcardForm } from "../decks/AddFlashcardForm";
import { FlashcardsList } from "../decks/FlashcardsList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

type DeckDetailsViewProps = {
  deckId: string;
};

/**
 * Main view component for the deck details page
 * Handles fetching, displaying, and managing deck details and flashcards
 */
export function DeckDetailsView({ deckId }: DeckDetailsViewProps) {
  const [editingFlashcardId, setEditingFlashcardId] = useState<string | undefined>();
  const [deletingFlashcardId, setDeletingFlashcardId] = useState<string | undefined>();

  // Fetch deck details
  const { data: deck, isLoading, isError, error: fetchError } = useDeckDetails(deckId);

  // Mutations
  const updateDeckMutation = useUpdateDeck();
  const addFlashcardMutation = useAddFlashcard();
  const updateFlashcardMutation = useUpdateFlashcard(deckId);
  const deleteFlashcardMutation = useDeleteFlashcard(deckId);

  // Handle deck name update
  const handleUpdateDeckName = useCallback(
    async (name: string) => {
      try {
        await updateDeckMutation.mutateAsync({
          deckId,
          data: { name },
        });
        toast.success("Nazwa talii została zaktualizowana", {
          description: `Nowa nazwa: ${name}`,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się zaktualizować nazwy talii";
        toast.error("Błąd aktualizacji", {
          description: errorMessage,
        });
      }
    },
    [deckId, updateDeckMutation]
  );

  // Handle deck deletion
  const handleDeleteDeck = useCallback(() => {
    // Redirect to decks list (deletion will be handled by DELETE endpoint)
    window.location.href = "/decks";
  }, []);

  // Handle adding a new flashcard
  const handleAddFlashcard = useCallback(
    async (front: string, back: string) => {
      try {
        await addFlashcardMutation.mutateAsync({
          deckId,
          data: { front, back },
        });
        toast.success("Fiszka została dodana", {
          description: "Nowa fiszka została pomyślnie utworzona.",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się dodać fiszki";
        toast.error("Błąd dodawania fiszki", {
          description: errorMessage,
        });
      }
    },
    [deckId, addFlashcardMutation]
  );

  // Handle flashcard edit
  const handleEditFlashcard = useCallback(
    async (flashcardId: string, front: string, back: string) => {
      setEditingFlashcardId(flashcardId);

      try {
        await updateFlashcardMutation.mutateAsync({
          flashcardId,
          data: { front, back },
        });
        toast.success("Fiszka została zaktualizowana", {
          description: "Zmiany zostały zapisane.",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się zaktualizować fiszki";
        toast.error("Błąd aktualizacji fiszki", {
          description: errorMessage,
        });
      } finally {
        setEditingFlashcardId(undefined);
      }
    },
    [updateFlashcardMutation]
  );

  // Handle flashcard deletion
  const handleDeleteFlashcard = useCallback(
    async (flashcardId: string) => {
      setDeletingFlashcardId(flashcardId);

      try {
        await deleteFlashcardMutation.mutateAsync(flashcardId);
        toast.success("Fiszka została usunięta", {
          description: "Fiszka została trwale usunięta.",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się usunąć fiszki";
        toast.error("Błąd usuwania fiszki", {
          description: errorMessage,
        });
      } finally {
        setDeletingFlashcardId(undefined);
      }
    },
    [deleteFlashcardMutation]
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[150px] w-full" />
        <Skeleton className="h-[150px] w-full" />
      </div>
    );
  }

  // Handle error state
  if (isError || !deck) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>
            {fetchError instanceof Error ? fetchError.message : "Nie udało się pobrać szczegółów talii"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      {/* Header with deck info and actions */}
      <DeckHeader
        deckName={deck.name}
        deckId={deck.id}
        flashcardCount={deck.flashcards.length}
        onUpdateName={handleUpdateDeckName}
        onDeleteDeck={handleDeleteDeck}
        isUpdating={updateDeckMutation.isPending}
      />

      {/* Add flashcard form */}
      <AddFlashcardForm onAdd={handleAddFlashcard} isAdding={addFlashcardMutation.isPending} />

      {/* Flashcards list */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Fiszki</h2>
        <FlashcardsList
          flashcards={deck.flashcards}
          isLoading={false}
          onEdit={handleEditFlashcard}
          onDelete={handleDeleteFlashcard}
          editingId={editingFlashcardId}
          deletingId={deletingFlashcardId}
        />
      </div>
    </div>
  );
}
