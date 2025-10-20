import type { DeckSummaryDTO } from "../../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DeckCardProps = {
  deck: DeckSummaryDTO;
  onDelete: (deckId: string) => void;
};

export const DeckCard = ({ deck, onDelete }: DeckCardProps) => {
  const createdDate = new Date(deck.created_at).toLocaleDateString("pl-PL");

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <CardTitle className="break-words">
          <a href={`/decks/${deck.id}`} className="hover:underline">
            {deck.name}
          </a>
        </CardTitle>
        <CardDescription>Utworzono: {createdDate}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">
          Fiszek: <span className="font-semibold">{deck.flashcard_count}</span>
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
          <a href={`/decks/${deck.id}/study`}>Ucz się</a>
        </Button>
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <a href={`/decks/${deck.id}`}>Edytuj</a>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(deck.id)}
          aria-label={`Usuń talię ${deck.name}`}
          className="w-full sm:w-auto"
        >
          Usuń
        </Button>
      </CardFooter>
    </Card>
  );
};
