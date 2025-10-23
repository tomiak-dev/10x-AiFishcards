import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, X, Check } from "lucide-react";

interface DeckHeaderProps {
  deckName: string;
  deckId: string;
  flashcardCount: number;
  onUpdateName: (name: string) => void;
  onDeleteDeck: () => void;
  isUpdating: boolean;
}

export const DeckHeader = ({
  deckName,
  deckId,
  flashcardCount,
  onUpdateName,
  onDeleteDeck,
  isUpdating,
}: DeckHeaderProps) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(deckName);

  const handleSave = () => {
    const trimmedName = name.trim();

    // Validate name
    if (!trimmedName) {
      return;
    }

    if (trimmedName.length > 100) {
      return;
    }

    // Only update if name changed
    if (trimmedName !== deckName) {
      onUpdateName(trimmedName);
    }

    setEditMode(false);
  };

  const handleCancel = () => {
    setName(deckName);
    setEditMode(false);
  };

  const handleDeleteDeck = () => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć całą talię? Ta operacja jest nieodwracalna i usunie wszystkie fiszki."
    );

    if (confirmed) {
      onDeleteDeck();
    }
  };

  // TODO: Remove in production - testing only
  const handleResetProgress = async () => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz zresetować postęp nauki dla tej talii? Wszystkie fiszki będą dostępne do nauki od nowa."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/decks/${deckId}/reset-progress`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset progress");
      }

      // Also clear sessionStorage
      sessionStorage.removeItem(`study_session_state_${deckId}`);

      alert("Postęp został zresetowany! Możesz teraz rozpocząć naukę od nowa.");

      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Failed to reset progress:", error);
      alert("Nie udało się zresetować postępu. Spróbuj ponownie.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-2">
          {editMode ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-primary focus:outline-none flex-1"
                autoFocus
                disabled={isUpdating}
              />
              <Button onClick={handleSave} size="icon" variant="ghost" disabled={isUpdating || !name.trim()}>
                <Check className="h-5 w-5" />
              </Button>
              <Button onClick={handleCancel} size="icon" variant="ghost" disabled={isUpdating}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-bold break-words">{deckName}</h1>
              <Button onClick={() => setEditMode(true)} size="icon" variant="ghost" aria-label="Edytuj nazwę talii">
                <Pencil className="h-5 w-5" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground">
            Liczba fiszek: <span className="font-semibold">{flashcardCount}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="default" className="w-full sm:w-auto">
            <a href={`/decks/${deckId}/study`}>Rozpocznij naukę</a>
          </Button>
          {/* TODO: Remove in production - testing only */}
          <Button onClick={handleResetProgress} variant="ghost" size="sm" className="w-full sm:w-auto">
            🔄 Resetuj postęp (test)
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href="/decks">Powrót do listy</a>
          </Button>
          <Button onClick={handleDeleteDeck} variant="destructive" className="w-full sm:w-auto">
            Usuń talię
          </Button>
        </div>
      </div>
    </div>
  );
};
