import { useState, useCallback } from "react";
import { AiGeneratorForm } from "../dashboard/AiGeneratorForm";
import { ProposalsList } from "../dashboard/ProposalsList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2 } from "lucide-react";
import { LogoutButton } from "../auth/LogoutButton";
import type { FlashcardProposal, GeneratorStatus, ApiError } from "../dashboard/types";
import type {
  GenerateFlashcardsCommand,
  FlashcardProposalsDTO,
  SaveAIFlashcardsCommand,
  AISaveResponseDTO,
} from "@/types";

export function DashboardView() {
  const [proposals, setProposals] = useState<FlashcardProposal[]>([]);
  const [status, setStatus] = useState<GeneratorStatus>("idle");
  const [error, setError] = useState<ApiError | null>(null);

  // Generate flashcard proposals from text
  const handleGenerate = useCallback(async (text: string) => {
    setStatus("loading");
    setError(null);

    try {
      const payload: GenerateFlashcardsCommand = { text };

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error codes with user-friendly messages
        let errorMessage = "Wystąpił błąd podczas generowania fiszek";

        if (response.status === 400) {
          errorMessage = "Tekst zawiera nieprawidłowe znaki lub jest za krótki/długi";
        } else if (response.status === 503) {
          errorMessage = "Usługa AI jest chwilowo niedostępna. Spróbuj ponownie za chwilę.";
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        throw new Error(errorMessage);
      }

      const data: FlashcardProposalsDTO = await response.json();

      // Map API response to client-side FlashcardProposal with accepted=true and original values
      const mappedProposals: FlashcardProposal[] = data.proposals.map((p) => ({
        id: p.id,
        front: p.front,
        back: p.back,
        accepted: true,
        originalFront: p.front,
        originalBack: p.back,
      }));

      setProposals(mappedProposals);
      setStatus("success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";

      setError({
        message: errorMessage,
        status: err instanceof Error && "status" in err ? (err as any).status : undefined,
      });
      setStatus("error");
    }
  }, []);

  // Save accepted flashcards as a new deck
  const handleSave = useCallback(
    async (acceptedProposals: FlashcardProposal[]) => {
      if (acceptedProposals.length === 0) {
        return;
      }

      setStatus("loading");
      setError(null);

      try {
        // Calculate metrics
        const proposedCount = proposals.length;
        const acceptedCount = acceptedProposals.length;
        const editedCount = acceptedProposals.filter(
          (p) => p.front !== p.originalFront || p.back !== p.originalBack
        ).length;

        const payload: SaveAIFlashcardsCommand = {
          flashcards: acceptedProposals.map((p) => ({
            front: p.front,
            back: p.back,
          })),
          metrics: {
            proposed_flashcards_count: proposedCount,
            accepted_flashcards_count: acceptedCount,
            edited_flashcards_count: editedCount,
          },
        };

        const response = await fetch("/api/ai/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Nie udało się zapisać talii");
        }

        const data: AISaveResponseDTO = await response.json();

        // Redirect to the new deck
        window.location.href = `/decks/${data.id}`;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd podczas zapisywania";

        setError({
          message: errorMessage,
        });
        setStatus("error");
      }
    },
    [proposals]
  );

  // Update a proposal
  const handleUpdate = useCallback((id: string, updatedProposal: FlashcardProposal) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? updatedProposal : p)));
  }, []);

  // Remove a proposal from the list
  const handleRemove = useCallback((id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Retry after error
  const handleRetry = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Generator fiszek AI</h1>
          <p className="text-muted-foreground">Wklej tekst, a AI wygeneruje dla Ciebie propozycje fiszek do nauki</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/decks">Moje talie</a>
          </Button>
          <LogoutButton variant="ghost" />
        </div>
      </div>

      {/* Error state */}
      {status === "error" && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error.message}</p>
            <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
              Spróbuj ponownie
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Form - visible in idle and error states */}
      {(status === "idle" || status === "error") && (
        <div className="bg-card border rounded-lg p-6">
          <AiGeneratorForm onGenerate={handleGenerate} status={status} />
        </div>
      )}

      {/* Loading state during generation */}
      {status === "loading" && proposals.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Generowanie propozycji fiszek...</p>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      )}

      {/* Proposals list - visible after successful generation */}
      {proposals.length > 0 && (
        <ProposalsList
          proposals={proposals}
          onSave={handleSave}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
          status={status}
        />
      )}
    </div>
  );
}
