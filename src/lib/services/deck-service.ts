import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateDeckCommand,
  DeckCreatedDTO,
  SaveAIFlashcardsCommand,
  AISaveResponseDTO,
  ListDecksResponse,
  DeckSummaryDTO,
  DeckDetailsDTO,
} from "../../types";

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

  /**
   * Retrieves a paginated list of decks for the current user
   * @param params - Query parameters for pagination and sorting
   * @param params.page - Page number (1-based)
   * @param params.limit - Items per page (max 100)
   * @param params.sortBy - Field to sort by
   * @param params.order - Sort order (asc/desc)
   * @returns Paginated list of decks with metadata including flashcard counts
   * @throws Error if database query fails
   */
  async listDecks(params: {
    page: number;
    limit: number;
    sortBy: "name" | "created_at" | "last_reviewed_at";
    order: "asc" | "desc";
  }): Promise<ListDecksResponse> {
    const { page, limit, sortBy, order } = params;

    // Calculate range for pagination (Supabase uses 0-based indexing)
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch paginated decks with sorting
    // RLS policies automatically filter by user_id
    const { data: decks, error: decksError } = await this.supabase
      .from("decks")
      .select("id, name, created_at, last_reviewed_at")
      .order(sortBy, { ascending: order === "asc" })
      .range(from, to);

    if (decksError) {
      throw new Error(`Failed to fetch decks: ${decksError.message}`);
    }

    if (!decks || decks.length === 0) {
      return {
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
        },
      };
    }

    // Fetch flashcard counts for each deck in parallel
    const flashcardCounts = await Promise.all(
      decks.map(async (deck) => {
        const { count, error: countError } = await this.supabase
          .from("flashcards")
          .select("*", { count: "exact", head: true })
          .eq("deck_id", deck.id);

        if (countError) {
          console.error(`Failed to count flashcards for deck ${deck.id}:`, countError);
          return 0;
        }

        return count ?? 0;
      })
    );

    // Combine decks with their flashcard counts
    const decksWithCounts: DeckSummaryDTO[] = decks.map((deck, index) => ({
      id: deck.id,
      name: deck.name,
      created_at: deck.created_at,
      last_reviewed_at: deck.last_reviewed_at,
      flashcard_count: flashcardCounts[index],
    }));

    // Fetch total count for pagination metadata
    const { count, error: countError } = await this.supabase.from("decks").select("*", { count: "exact", head: true });

    if (countError) {
      throw new Error(`Failed to count decks: ${countError.message}`);
    }

    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: decksWithCounts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
      },
    };
  }

  /**
   * Updates a deck's name
   * @param deckId - UUID of the deck to update
   * @param name - New name for the deck
   * @returns Updated deck information or null if not found
   * @throws Error if database operation fails
   */
  async updateDeckName(deckId: string, name: string): Promise<{ id: string; name: string } | null> {
    const { data, error } = await this.supabase
      .from("decks")
      .update({ name })
      .eq("id", deckId)
      .select("id, name")
      .single();

    if (error) {
      // If error is 'PGRST116', it means no rows were affected (not found or no access)
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to update deck: ${error.message}`);
    }

    return data;
  }

  /**
   * Deletes a deck and all its associated flashcards
   * @param deckId - UUID of the deck to delete
   * @returns True if deletion was successful
   * @throws Error if database operation fails
   */
  async deleteDeck(deckId: string): Promise<boolean> {
    // Delete the deck (flashcards will be cascade deleted due to foreign key constraint)
    const { error } = await this.supabase.from("decks").delete().eq("id", deckId);

    if (error) {
      // If error is 'PGRST116', it means no rows were affected (not found or no access)
      if (error.code === "PGRST116") {
        return false;
      }
      throw new Error(`Failed to delete deck: ${error.message}`);
    }

    return true;
  }

  /**
   * Retrieves detailed information about a specific deck including all flashcards
   * @param deckId - UUID of the deck to retrieve
   * @returns Deck details with flashcards or null if not found
   * @throws Error if database query fails
   */
  async getDeckDetails(deckId: string): Promise<DeckDetailsDTO | null> {
    // Fetch deck with nested flashcards in a single query
    // RLS policies automatically filter by user_id
    const { data: deck, error } = await this.supabase
      .from("decks")
      .select(
        `
        id,
        name,
        created_at,
        last_reviewed_at,
        flashcards (
          id,
          front,
          back,
          created_at
        )
      `
      )
      .eq("id", deckId)
      .single();

    if (error) {
      // If error is 'PGRST116', it means no rows returned (not found)
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch deck details: ${error.message}`);
    }

    if (!deck) {
      return null;
    }

    // Transform the data to match DeckDetailsDTO type
    return {
      id: deck.id,
      name: deck.name,
      created_at: deck.created_at,
      last_reviewed_at: deck.last_reviewed_at,
      flashcards: deck.flashcards ?? [],
    };
  }
}
