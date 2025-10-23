import type { SupabaseClient } from "../../db/supabase.client";
import type { ReviewFlashcardDTO, ReviewResponseDTO, ReviewQualityEnum } from "../../types";

/**
 * Retrieves flashcards from a deck that are due for review
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param deckId - UUID of the deck to retrieve flashcards from
 * @returns Array of flashcards due for review (max 50)
 * @throws Error if deck not found or user doesn't have access
 */
export async function getFlashcardsForReview(
  supabase: SupabaseClient,
  userId: string,
  deckId: string
): Promise<ReviewFlashcardDTO[]> {
  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split("T")[0];

  // Query flashcards_with_srs view for flashcards due for review
  const { data, error } = await supabase
    .from("flashcards_with_srs")
    .select("id, front, back")
    .eq("deck_id", deckId)
    .eq("user_id", userId)
    .lte("due_date", currentDate)
    .limit(50);

  if (error) {
    console.error("Error fetching flashcards for review:", error);
    throw new Error("Failed to fetch flashcards");
  }

  // If no results, verify deck exists and user has access
  if (!data || data.length === 0) {
    const { data: deckData, error: deckError } = await supabase
      .from("decks")
      .select("id")
      .eq("id", deckId)
      .eq("user_id", userId)
      .single();

    if (deckError || !deckData) {
      throw new Error("Deck not found");
    }
  }

  // Filter out any invalid data and ensure type safety
  return (data || []).filter(
    (flashcard): flashcard is ReviewFlashcardDTO =>
      flashcard.id !== null && flashcard.front !== null && flashcard.back !== null
  );
}

/**
 * Submits a review for a flashcard and updates SRS data
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param flashcardId - UUID of the flashcard being reviewed
 * @param quality - Review quality assessment ('again', 'good', or 'easy')
 * @returns Updated review response with next due date and interval
 * @throws Error if flashcard not found, user doesn't have access, or database operation fails
 */
export async function submitReview(
  supabase: SupabaseClient,
  userId: string,
  flashcardId: string,
  quality: ReviewQualityEnum
): Promise<ReviewResponseDTO> {
  // 1. Verify flashcard ownership
  const { data: flashcardData, error: flashcardError } = await supabase
    .from("flashcards_with_srs")
    .select("id, user_id")
    .eq("id", flashcardId)
    .single();

  if (flashcardError || !flashcardData) {
    throw new Error("Flashcard not found");
  }

  if (flashcardData.user_id !== userId) {
    // Don't reveal that flashcard exists but user doesn't have access
    throw new Error("Flashcard not found");
  }

  // 2. Call PostgreSQL function to update SRS data
  const { error: updateError } = await supabase.rpc("update_srs_data_on_review", {
    p_flashcard_id: flashcardId,
    p_quality: quality,
  });

  if (updateError) {
    console.error("Error calling update_srs_data_on_review:", updateError);
    throw new Error("Failed to update review data");
  }

  // 3. Fetch updated SRS data
  const { data: srsData, error: srsError } = await supabase
    .from("flashcard_srs_data")
    .select("due_date, interval")
    .eq("flashcard_id", flashcardId)
    .single();

  if (srsError || !srsData) {
    console.error("Error fetching updated SRS data:", srsError);
    throw new Error("Failed to fetch updated SRS data");
  }

  return {
    flashcard_id: flashcardId,
    next_due_date: srsData.due_date,
    new_interval: srsData.interval,
  };
}
