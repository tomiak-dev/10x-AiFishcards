import { useState } from "react";
import type { FlashcardDTO } from "../../types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type FlashcardRowProps = {
  flashcard: FlashcardDTO;
  onEdit: (id: string, front: string, back: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  isDeleting: boolean;
};

export const FlashcardRow = ({ flashcard, onEdit, onDelete, isEditing, isDeleting }: FlashcardRowProps) => {
  const [editMode, setEditMode] = useState(false);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);
  const [errors, setErrors] = useState({ front: "", back: "" });

  const validateFront = (value: string) => {
    if (!value.trim()) {
      return "Przód fiszki jest wymagany";
    }
    if (value.length > 200) {
      return "Przód fiszki nie może przekraczać 200 znaków";
    }
    return "";
  };

  const validateBack = (value: string) => {
    if (!value.trim()) {
      return "Tył fiszki jest wymagany";
    }
    if (value.length > 500) {
      return "Tył fiszki nie może przekraczać 500 znaków";
    }
    return "";
  };

  const handleSave = () => {
    // Validate before saving
    const frontError = validateFront(front);
    const backError = validateBack(back);

    setErrors({ front: frontError, back: backError });

    if (frontError || backError) {
      return;
    }

    onEdit(flashcard.id, front, back);
    setEditMode(false);
    setErrors({ front: "", back: "" });
  };

  const handleCancel = () => {
    // Reset to original values
    setFront(flashcard.front);
    setBack(flashcard.back);
    setErrors({ front: "", back: "" });
    setEditMode(false);
  };

  const handleFrontChange = (value: string) => {
    setFront(value);
    if (errors.front) {
      setErrors((prev) => ({ ...prev, front: validateFront(value) }));
    }
  };

  const handleBackChange = (value: string) => {
    setBack(value);
    if (errors.back) {
      setErrors((prev) => ({ ...prev, back: validateBack(value) }));
    }
  };

  const handleDelete = () => {
    const confirmed = window.confirm("Czy na pewno chcesz usunąć tę fiszkę?");
    if (confirmed) {
      onDelete(flashcard.id);
    }
  };

  if (editMode) {
    return (
      <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
        <div className="space-y-2">
          <label htmlFor={`front-${flashcard.id}`} className="text-sm font-medium">
            Przód fiszki *
          </label>
          <Textarea
            id={`front-${flashcard.id}`}
            value={front}
            onChange={(e) => handleFrontChange(e.target.value)}
            maxLength={200}
            rows={2}
            className={`resize-none ${errors.front ? "border-red-500" : ""}`}
            disabled={isEditing}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{front.length}/200 znaków</p>
            {errors.front && <p className="text-xs text-red-500">{errors.front}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor={`back-${flashcard.id}`} className="text-sm font-medium">
            Tył fiszki *
          </label>
          <Textarea
            id={`back-${flashcard.id}`}
            value={back}
            onChange={(e) => handleBackChange(e.target.value)}
            maxLength={500}
            rows={3}
            className={`resize-none ${errors.back ? "border-red-500" : ""}`}
            disabled={isEditing}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{back.length}/500 znaków</p>
            {errors.back && <p className="text-xs text-red-500">{errors.back}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleSave} size="sm" disabled={isEditing} className="w-full sm:w-auto">
            {isEditing ? "Zapisywanie..." : "Zapisz"}
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm" disabled={isEditing} className="w-full sm:w-auto">
            Anuluj
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-muted-foreground">Przód:</p>
        <p className="text-base">{flashcard.front}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-muted-foreground">Tył:</p>
        <p className="text-base">{flashcard.back}</p>
      </div>
      <div className="flex flex-col gap-2 pt-2 sm:flex-row">
        <Button
          onClick={() => setEditMode(true)}
          variant="outline"
          size="sm"
          disabled={isEditing || isDeleting}
          className="w-full sm:w-auto"
        >
          Edytuj
        </Button>
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="sm"
          disabled={isEditing || isDeleting}
          className="w-full sm:w-auto"
        >
          {isDeleting ? "Usuwanie..." : "Usuń"}
        </Button>
      </div>
    </div>
  );
};
