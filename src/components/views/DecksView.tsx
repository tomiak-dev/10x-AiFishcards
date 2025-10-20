import { useCallback } from "react";
import { useDecks, useDeleteDeck } from "../hooks/useDecks";
import { DecksList } from "../decks/DecksList";
import { EmptyState } from "../decks/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * Main view component for the decks list page
 * Handles fetching, displaying, and managing decks
 */
export function DecksView() {
  // Fetch decks using TanStack Query
  const { data, isLoading, isError, error } = useDecks({
    page: 1,
    limit: 20,
    sortBy: "created_at",
    order: "desc",
  });

  // Delete deck mutation
  const deleteMutation = useDeleteDeck();

  // Handle deck deletion
  const handleDelete = useCallback(
    async (deckId: string) => {
      // Confirm deletion
      const confirmed = window.confirm("Czy na pewno chcesz usunąć tę talię? Ta operacja jest nieodwracalna.");

      if (!confirmed) {
        return;
      }

      try {
        await deleteMutation.mutateAsync(deckId);
        toast.success("Talia została usunięta", {
          description: "Talia i wszystkie jej fiszki zostały trwale usunięte.",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się usunąć talii";
        toast.error("Błąd usuwania talii", {
          description: errorMessage,
        });
      }
    },
    [deleteMutation]
  );

  // Handle error state
  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Nie udało się pobrać listy talii"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const decks = data?.data ?? [];
  const hasDecks = decks.length > 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold">Moje talie</h1>
          <p className="text-muted-foreground">Zarządzaj swoimi taliami fiszek</p>
        </div>
        <Button asChild>
          <a href="/">Utwórz nową talię</a>
        </Button>
      </div>

      {/* Decks list or empty state */}
      {!isLoading && !hasDecks ? (
        <EmptyState />
      ) : (
        <DecksList decks={decks} isLoading={isLoading} onDelete={handleDelete} />
      )}
    </div>
  );
}
