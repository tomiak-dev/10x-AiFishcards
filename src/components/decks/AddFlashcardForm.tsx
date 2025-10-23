import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AddFlashcardFormProps {
  onAdd: (front: string, back: string) => void;
  isAdding: boolean;
}

export const AddFlashcardForm = ({ onAdd, isAdding }: AddFlashcardFormProps) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const frontError = validateFront(front);
    const backError = validateBack(back);

    setErrors({ front: frontError, back: backError });

    if (frontError || backError) {
      return;
    }

    onAdd(front, back);

    // Reset form
    setFront("");
    setBack("");
    setErrors({ front: "", back: "" });
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setFront("");
    setBack("");
    setErrors({ front: "", back: "" });
    setIsExpanded(false);
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

  if (!isExpanded) {
    return (
      <Button onClick={() => setIsExpanded(true)} className="w-full" size="lg">
        + Dodaj nową fiszkę
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj nową fiszkę</CardTitle>
        <CardDescription>Wypełnij oba pola, aby utworzyć nową fiszkę</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-front" className="text-sm font-medium">
              Przód fiszki *
            </label>
            <Textarea
              id="new-front"
              value={front}
              onChange={(e) => handleFrontChange(e.target.value)}
              maxLength={200}
              rows={2}
              className={`resize-none ${errors.front ? "border-red-500" : ""}`}
              placeholder="Wprowadź pytanie lub termin..."
              disabled={isAdding}
              required
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">{front.length}/200 znaków</p>
              {errors.front && <p className="text-xs text-red-500">{errors.front}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="new-back" className="text-sm font-medium">
              Tył fiszki *
            </label>
            <Textarea
              id="new-back"
              value={back}
              onChange={(e) => handleBackChange(e.target.value)}
              maxLength={500}
              rows={3}
              className={`resize-none ${errors.back ? "border-red-500" : ""}`}
              placeholder="Wprowadź odpowiedź lub definicję..."
              disabled={isAdding}
              required
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">{back.length}/500 znaków</p>
              {errors.back && <p className="text-xs text-red-500">{errors.back}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={isAdding} className="w-full sm:w-auto">
              {isAdding ? "Dodawanie..." : "Dodaj fiszkę"}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              disabled={isAdding}
              className="w-full sm:w-auto"
            >
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
