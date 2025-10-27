import type { APIRoute } from "astro";
import { getDeckReviewParamsSchema } from "../../../../lib/schemas/review-schemas";
import { resetDeckProgress } from "../../../../lib/services/review-service";
import { ZodError } from "zod";

export const prerender = false;

/**
 * POST /api/decks/{deckId}/reset-progress
 * Resets the learning progress for all flashcards in a deck (testing only)
 * Sets due_date to current date and resets SRS data to initial values
 *
 * TODO: Remove in production - testing only
 *
 * Path Parameters:
 * - deckId: UUID of the deck to reset
 *
 * Response:
 * - 200: Progress reset successfully
 * - 400: Invalid deck ID format
 * - 401: Unauthorized (no valid session)
 * - 404: Deck not found or user doesn't have access
 * - 500: Internal server error
 */
export const POST: APIRoute = async ({ locals, params }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract and validate deckId parameter
    const { deckId } = params;

    if (!deckId) {
      return new Response(
        JSON.stringify({
          error: "Bad request",
          message: "Deck ID is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate deckId format (must be UUID)
    let validated;
    try {
      validated = getDeckReviewParamsSchema.parse({ deckId });
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: "Invalid deck ID format",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      throw error;
    }

    // Reset deck progress
    await resetDeckProgress(locals.supabase, locals.user.id, validated.deckId);

    return new Response(
      JSON.stringify({
        message: "Deck progress reset successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error && error.message === "Deck not found") {
      return new Response(
        JSON.stringify({
          error: "Deck not found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error in POST /api/decks/[deckId]/reset-progress:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
