import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { GeneratorStatus } from "./types";

interface AiGeneratorFormProps {
  onGenerate: (text: string) => void;
  status: GeneratorStatus;
}

const MIN_CHARACTERS = 2000;
const MAX_CHARACTERS = 10000;

export function AiGeneratorForm({ onGenerate, status }: AiGeneratorFormProps) {
  const [text, setText] = useState("");

  const charCount = text.length;
  const isValid = charCount >= MIN_CHARACTERS && charCount <= MAX_CHARACTERS;
  const isLoading = status === "loading";

  // Determine character counter color based on validation rules
  const counterColorClass = useMemo(() => {
    if (charCount < MIN_CHARACTERS) return "text-muted-foreground";
    if (charCount <= MAX_CHARACTERS) return "text-green-600";
    return "text-destructive";
  }, [charCount]);

  // Determine validation message
  const validationMessage = useMemo(() => {
    if (charCount === 0) return null;
    if (charCount < MIN_CHARACTERS) {
      return `Potrzebujesz jeszcze ${MIN_CHARACTERS - charCount} znaków`;
    }
    if (charCount > MAX_CHARACTERS) {
      return `Przekroczono limit o ${charCount - MAX_CHARACTERS} znaków`;
    }
    return null;
  }, [charCount]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid && !isLoading) {
        onGenerate(text);
      }
    },
    [isValid, isLoading, onGenerate, text]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="source-text">Tekst źródłowy</Label>
        <Textarea
          id="source-text"
          value={text}
          onChange={handleTextChange}
          placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki (minimum 2000 znaków)..."
          className="min-h-[300px] resize-y"
          aria-describedby="char-counter validation-message"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between gap-2">
          <div
            id="char-counter"
            className={`text-sm font-medium transition-colors ${counterColorClass}`}
            aria-live="polite"
          >
            {charCount.toLocaleString("pl-PL")} / {MAX_CHARACTERS.toLocaleString("pl-PL")} znaków
          </div>
          {validationMessage && (
            <div id="validation-message" className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {validationMessage}
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={!isValid || isLoading} className="w-full">
        {isLoading ? "Generowanie..." : "Generuj fiszki"}
      </Button>
    </form>
  );
}
