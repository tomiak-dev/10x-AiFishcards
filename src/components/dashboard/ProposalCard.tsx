import { useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import type { FlashcardProposal } from "./types";

interface ProposalCardProps {
  proposal: FlashcardProposal;
  onUpdate: (id: string, updatedProposal: FlashcardProposal) => void;
  onRemove: (id: string) => void;
}

const MAX_FRONT_CHARACTERS = 200;
const MAX_BACK_CHARACTERS = 500;

export function ProposalCard({ proposal, onUpdate, onRemove }: ProposalCardProps) {
  const frontCharCount = proposal.front.length;
  const backCharCount = proposal.back.length;

  const isFrontValid = frontCharCount <= MAX_FRONT_CHARACTERS;
  const isBackValid = backCharCount <= MAX_BACK_CHARACTERS;

  // Character counter color for front
  const frontCounterColorClass = useMemo(() => {
    return isFrontValid ? "text-muted-foreground" : "text-destructive";
  }, [isFrontValid]);

  // Character counter color for back
  const backCounterColorClass = useMemo(() => {
    return isBackValid ? "text-muted-foreground" : "text-destructive";
  }, [isBackValid]);

  const handleAcceptedChange = useCallback(
    (checked: boolean) => {
      onUpdate(proposal.id, { ...proposal, accepted: checked });
    },
    [proposal, onUpdate]
  );

  const handleFrontChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate(proposal.id, { ...proposal, front: e.target.value });
    },
    [proposal, onUpdate]
  );

  const handleBackChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate(proposal.id, { ...proposal, back: e.target.value });
    },
    [proposal, onUpdate]
  );

  const handleRemove = useCallback(() => {
    onRemove(proposal.id);
  }, [proposal.id, onRemove]);

  return (
    <div
      className={`rounded-lg border bg-card p-4 space-y-4 transition-opacity ${
        proposal.accepted ? "opacity-100" : "opacity-60"
      }`}
    >
      {/* Header with checkbox and remove button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`accepted-${proposal.id}`}
            checked={proposal.accepted}
            onCheckedChange={handleAcceptedChange}
            aria-label="Zaakceptuj fiszkę"
          />
          <Label htmlFor={`accepted-${proposal.id}`} className="text-sm font-medium cursor-pointer">
            {proposal.accepted ? "Zaakceptowano" : "Odrzucono"}
          </Label>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          aria-label="Usuń fiszkę"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Front side */}
      <div className="space-y-2">
        <Label htmlFor={`front-${proposal.id}`}>Przód fiszki</Label>
        <Textarea
          id={`front-${proposal.id}`}
          value={proposal.front}
          onChange={handleFrontChange}
          placeholder="Pytanie lub pojęcie..."
          className="min-h-[80px] resize-y"
          aria-describedby={`front-counter-${proposal.id}`}
        />
        <div className="flex items-center justify-between">
          <div
            id={`front-counter-${proposal.id}`}
            className={`text-sm font-medium transition-colors ${frontCounterColorClass}`}
            aria-live="polite"
          >
            {frontCharCount} / {MAX_FRONT_CHARACTERS} znaków
          </div>
          {!isFrontValid && (
            <div className="text-sm text-destructive" role="alert">
              Przekroczono limit o {frontCharCount - MAX_FRONT_CHARACTERS} znaków
            </div>
          )}
        </div>
      </div>

      {/* Back side */}
      <div className="space-y-2">
        <Label htmlFor={`back-${proposal.id}`}>Tył fiszki</Label>
        <Textarea
          id={`back-${proposal.id}`}
          value={proposal.back}
          onChange={handleBackChange}
          placeholder="Odpowiedź lub definicja..."
          className="min-h-[120px] resize-y"
          aria-describedby={`back-counter-${proposal.id}`}
        />
        <div className="flex items-center justify-between">
          <div
            id={`back-counter-${proposal.id}`}
            className={`text-sm font-medium transition-colors ${backCounterColorClass}`}
            aria-live="polite"
          >
            {backCharCount} / {MAX_BACK_CHARACTERS} znaków
          </div>
          {!isBackValid && (
            <div className="text-sm text-destructive" role="alert">
              Przekroczono limit o {backCharCount - MAX_BACK_CHARACTERS} znaków
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
