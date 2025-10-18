import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ProposalCard } from "./ProposalCard";
import type { FlashcardProposal, GeneratorStatus } from "./types";

interface ProposalsListProps {
  proposals: FlashcardProposal[];
  onSave: (acceptedProposals: FlashcardProposal[]) => void;
  onUpdate: (id: string, updatedProposal: FlashcardProposal) => void;
  onRemove: (id: string) => void;
  status: GeneratorStatus;
}

export function ProposalsList({ proposals, onSave, onUpdate, onRemove, status }: ProposalsListProps) {
  const acceptedProposals = useMemo(() => proposals.filter((p) => p.accepted), [proposals]);

  const acceptedCount = acceptedProposals.length;
  const totalCount = proposals.length;
  const canSave = acceptedCount > 0 && status !== "loading";

  const handleSave = useCallback(() => {
    if (canSave) {
      onSave(acceptedProposals);
    }
  }, [canSave, acceptedProposals, onSave]);

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Wygenerowane propozycje</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Zaznaczono {acceptedCount} z {totalCount}{" "}
            {totalCount === 1 ? "propozycji" : totalCount < 5 ? "propozycje" : "propozycji"}
          </p>
        </div>

        <Button onClick={handleSave} disabled={!canSave} size="lg" className="min-w-[180px]">
          {status === "loading" ? "Zapisywanie..." : "Zapisz jako talię"}
        </Button>
      </div>

      {/* Scrollable list of proposals */}
      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} onUpdate={onUpdate} onRemove={onRemove} />
        ))}
      </div>

      {/* Footer with save button for mobile */}
      <div className="sticky bottom-0 bg-background pt-4 border-t md:hidden">
        <Button onClick={handleSave} disabled={!canSave} size="lg" className="w-full">
          {status === "loading" ? "Zapisywanie..." : "Zapisz jako talię"}
        </Button>
      </div>
    </div>
  );
}
