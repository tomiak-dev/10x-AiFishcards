import type { APIRoute } from "astro";
import { getDeckReviewParamsSchema } from "../../../../lib/schemas/review-schemas";
import { getFlashcardsForReview } from "../../../../lib/services/review-service";
import type { ReviewFlashcardsDTO } from "../../../../types";
import { ZodError } from "zod";
import { createSupabaseServerInstance } from "../../../../db/supabase.client";

export const prerender = false;

/**
 * GET /api/decks/{deckId}/review
 * Retrieves flashcards from a deck that are due for review (due_date <= current date)
 *
 * Path Parameters:
 * - deckId: UUID of the deck to retrieve flashcards from
 *
 * Response:
 * - 200: Array of flashcards due for review (max 50, may be empty if no flashcards due)
 * - 400: Invalid deck ID format
 * - 401: Unauthorized (no valid session)
 * - 404: Deck not found or user doesn't have access
 * - 500: Internal server error
 */
export const GET: APIRoute = async ({ locals, params, cookies, request }) => {
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

    // Fetch flashcards for review
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const flashcards = await getFlashcardsForReview(supabase, locals.user.id, validated.deckId);

    const response: ReviewFlashcardsDTO = { flashcards };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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
    console.error("Unexpected error in GET /api/decks/[deckId]/review:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
