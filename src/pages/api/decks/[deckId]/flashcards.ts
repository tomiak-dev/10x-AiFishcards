import type { APIRoute } from "astro";
import { DeckService } from "../../../../lib/services/deck-service";
import { FlashcardService } from "../../../../lib/services/flashcard-service";
import { DeckIdSchema } from "../../../../lib/schemas/deck.schemas";
import { AddFlashcardSchema } from "../../../../lib/schemas/flashcard.schemas";
import { ZodError } from "zod";

export const prerender = false;

/**
 * POST /api/decks/{deckId}/flashcards
 * Adds a new flashcard to a deck
 *
 * Path Parameters:
 * - deckId: UUID of the deck
 *
 * Request Body:
 * - front: Front text of the flashcard
 * - back: Back text of the flashcard
 *
 * Response:
 * - 201: Flashcard created successfully
 * - 400: Invalid request (bad deckId format or invalid body)
 * - 401: Unauthorized (no valid session)
 * - 404: Deck not found or user doesn't have access
 * - 500: Internal server error
 */
export const POST: APIRoute = async ({ locals, params, request }) => {
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

    // Verify deck exists and user has access
    const deckService = new DeckService(locals.supabase);
    const deck = await deckService.getDeckDetails(deckId);

    if (!deck) {
      return new Response(
        JSON.stringify({
          error: "Not found",
          message: "Deck not found or you don't have access to it",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON",
          message: "Request body must be valid JSON",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let validatedData;
    try {
      validatedData = AddFlashcardSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: "Invalid request body",
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

    // Add flashcard to deck
    const flashcardService = new FlashcardService(locals.supabase);
    const newFlashcard = await flashcardService.addFlashcard(deckId, validatedData);

    // Return created flashcard
    return new Response(JSON.stringify(newFlashcard), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error adding flashcard:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
