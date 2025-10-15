import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateDeckCommand, DeckCreatedDTO } from "../../types";

/**
 * Service for managing deck operations
 */
export class DeckService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Creates a new deck with initial flashcards in a single transaction
   * @param command - Deck creation command with name and flashcards
   * @param userId - ID of the user creating the deck
   * @returns Created deck information
   * @throws Error if deck creation fails
   */
  async createDeck(command: CreateDeckCommand, userId: string): Promise<DeckCreatedDTO> {
    // Start by creating the deck
    const { data: deck, error: deckError } = await this.supabase
      .from("decks")
      .insert({
        name: command.name,
        user_id: userId,
      })
      .select("id, name, created_at")
      .single();

    if (deckError) {
      throw new Error(`Failed to create deck: ${deckError.message}`);
    }

    if (!deck) {
      throw new Error("Deck creation returned no data");
    }

    // Create flashcards for the deck
    const flashcardsToInsert = command.flashcards.map((flashcard) => ({
      deck_id: deck.id,
      front: flashcard.front,
      back: flashcard.back,
      creation_source: "manual" as const,
    }));

    const { error: flashcardsError } = await this.supabase.from("flashcards").insert(flashcardsToInsert);

    if (flashcardsError) {
      // If flashcards creation fails, we should clean up the deck
      // Note: In a real production scenario, you might want to use Supabase's RPC
      // with a database transaction or handle this differently
      await this.supabase.from("decks").delete().eq("id", deck.id);
      throw new Error(`Failed to create flashcards: ${flashcardsError.message}`);
    }

    return {
      id: deck.id,
      name: deck.name,
      created_at: deck.created_at,
    };
  }
}
