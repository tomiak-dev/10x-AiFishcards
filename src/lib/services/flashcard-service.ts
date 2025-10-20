import type { SupabaseClient } from "../../db/supabase.client";
import type {
  AddFlashcardCommand,
  UpdateFlashcardCommand,
  FlashcardCreatedDTO,
  FlashcardUpdatedDTO,
} from "../../types";

/**
 * Service for managing flashcard operations
 */
export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Adds a new flashcard to a deck
   * @param deckId - UUID of the deck
   * @param command - Flashcard data (front and back)
   * @returns Created flashcard information
   * @throws Error if flashcard creation fails
   */
  async addFlashcard(deckId: string, command: AddFlashcardCommand): Promise<FlashcardCreatedDTO> {
    const { data: flashcard, error } = await this.supabase
      .from("flashcards")
      .insert({
        deck_id: deckId,
        front: command.front,
        back: command.back,
        creation_source: "manual" as const,
      })
      .select("id, deck_id, front, back, created_at")
      .single();

    if (error) {
      throw new Error(`Failed to create flashcard: ${error.message}`);
    }

    if (!flashcard) {
      throw new Error("Flashcard creation returned no data");
    }

    return flashcard;
  }

  /**
   * Updates an existing flashcard
   * @param flashcardId - UUID of the flashcard to update
   * @param command - Updated flashcard data (front and back)
   * @returns Updated flashcard information or null if not found
   * @throws Error if flashcard update fails
   */
  async updateFlashcard(flashcardId: string, command: UpdateFlashcardCommand): Promise<FlashcardUpdatedDTO | null> {
    const { data: flashcard, error } = await this.supabase
      .from("flashcards")
      .update({
        front: command.front,
        back: command.back,
      })
      .eq("id", flashcardId)
      .select("id, front, back, changed_at")
      .single();

    if (error) {
      // If error is 'PGRST116', it means no rows were affected (not found or no access)
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to update flashcard: ${error.message}`);
    }

    return flashcard;
  }

  /**
   * Deletes a flashcard
   * @param flashcardId - UUID of the flashcard to delete
   * @returns True if deletion was successful
   * @throws Error if flashcard deletion fails
   */
  async deleteFlashcard(flashcardId: string): Promise<boolean> {
    const { error } = await this.supabase.from("flashcards").delete().eq("id", flashcardId);

    if (error) {
      // If error is 'PGRST116', it means no rows were affected (not found or no access)
      if (error.code === "PGRST116") {
        return false;
      }
      throw new Error(`Failed to delete flashcard: ${error.message}`);
    }

    return true;
  }
}
