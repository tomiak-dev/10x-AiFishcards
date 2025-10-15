import type { APIRoute } from "astro";
import { DeckService } from "../../../lib/services/deck-service";
import { DeckIdSchema } from "../../../lib/schemas/deck.schemas";
import { ZodError } from "zod";

export const prerender = false;

/**
 * GET /api/decks/{deckId}
 * Retrieves detailed information about a specific deck including all flashcards
 *
 * Path Parameters:
 * - deckId: UUID of the deck to retrieve
 *
 * Response:
 * - 200: Deck details with flashcards
 * - 400: Invalid deck ID format
 * - 401: Unauthorized (no valid session)
 * - 404: Deck not found or user doesn't have access
 * - 500: Internal server error
 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    // Check authentication
    if (!locals.userId) {
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
    try {
      DeckIdSchema.parse(deckId);
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: "Invalid deck ID",
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

    // Initialize service and fetch deck details
    const deckService = new DeckService(locals.supabase);
    const deck = await deckService.getDeckDetails(deckId);

    // Check if deck was found
    if (!deck) {
      return new Response(
        JSON.stringify({
          error: "Not found",
          message: "Deck not found or you don't have access to it",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return deck details
    return new Response(JSON.stringify(deck), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching deck details:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
