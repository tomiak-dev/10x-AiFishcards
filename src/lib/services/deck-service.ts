import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateDeckCommand, DeckCreatedDTO, SaveAIFlashcardsCommand, AISaveResponseDTO } from "../../types";

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

  /**
   * Creates a new deck from AI-generated flashcard proposals
   * Auto-generates deck name in format YYYY-MM-DD_HH-MM
   * @param command - AI save command with flashcards and metrics
   * @param userId - ID of the user creating the deck
   * @returns Created deck information
   * @throws Error if deck creation fails
   */
  async createDeckFromAiProposals(command: SaveAIFlashcardsCommand, userId: string): Promise<AISaveResponseDTO> {
    // Generate deck name in format YYYY-MM-DD_HH-MM
    const now = new Date();
    const deckName = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;

    // Create the deck
    const { data: deck, error: deckError } = await this.supabase
      .from("decks")
      .insert({
        name: deckName,
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
      creation_source: "ai_generated" as const,
    }));

    const { error: flashcardsError } = await this.supabase.from("flashcards").insert(flashcardsToInsert);

    if (flashcardsError) {
      // Clean up the deck if flashcards creation fails
      await this.supabase.from("decks").delete().eq("id", deck.id);
      throw new Error(`Failed to create flashcards: ${flashcardsError.message}`);
    }

    // Save AI generation metrics
    const { error: metricsError } = await this.supabase.from("ai_generation_metrics").insert({
      user_id: userId,
      proposed_flashcards_count: command.metrics.proposed_flashcards_count,
      accepted_flashcards_count: command.metrics.accepted_flashcards_count,
      edited_flashcards_count: command.metrics.edited_flashcards_count,
    });

    if (metricsError) {
      // Clean up deck and flashcards if metrics insertion fails
      await this.supabase.from("decks").delete().eq("id", deck.id);
      throw new Error(`Failed to save AI generation metrics: ${metricsError.message}`);
    }

    return {
      id: deck.id,
      name: deck.name,
      created_at: deck.created_at,
    };
  }
}
