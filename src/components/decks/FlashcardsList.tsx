import type { FlashcardDTO } from "../../types";
import { FlashcardRow } from "./FlashcardRow";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FlashcardsListProps {
  flashcards: FlashcardDTO[];
  isLoading: boolean;
  onEdit: (id: string, front: string, back: string) => void;
  onDelete: (id: string) => void;
  editingId?: string;
  deletingId?: string;
}

export const FlashcardsList = ({
  flashcards,
  isLoading,
  onEdit,
  onDelete,
  editingId,
  deletingId,
}: FlashcardsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[180px] w-full" />
        ))}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Ta talia nie zawiera jeszcze żadnych fiszek.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {flashcards.map((flashcard) => (
        <FlashcardRow
          key={flashcard.id}
          flashcard={flashcard}
          onEdit={onEdit}
          onDelete={onDelete}
          isEditing={editingId === flashcard.id}
          isDeleting={deletingId === flashcard.id}
        />
      ))}
    </div>
  );
};
