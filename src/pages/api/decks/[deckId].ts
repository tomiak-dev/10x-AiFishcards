import type { APIRoute } from "astro";
import { DeckService } from "../../../lib/services/deck-service";
import { DeckIdSchema, UpdateDeckSchema } from "../../../lib/schemas/deck.schemas";
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

/**
 * DELETE /api/decks/{deckId}
 * Deletes a specific deck and all its flashcards
 *
 * Path Parameters:
 * - deckId: UUID of the deck to delete
 *
 * Response:
 * - 204: Deck deleted successfully
 * - 400: Invalid deck ID format
 * - 401: Unauthorized (no valid session)
 * - 404: Deck not found or user doesn't have access
 * - 500: Internal server error
 */
export const DELETE: APIRoute = async ({ locals, params }) => {
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

    // Initialize service and delete deck
    const deckService = new DeckService(locals.supabase);
    const deleted = await deckService.deleteDeck(deckId);

    // Check if deck was found and deleted
    if (!deleted) {
      return new Response(
        JSON.stringify({
          error: "Not found",
          message: "Deck not found or you don't have access to it",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return success with no content
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting deck:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * PATCH /api/decks/{deckId}
 * Updates a deck's name
 *
 * Path Parameters:
 * - deckId: UUID of the deck to update
 *
 * Request Body:
 * - name: New name for the deck
 *
 * Response:
 * - 200: Deck updated successfully
 * - 400: Invalid request (bad deckId format or invalid body)
 * - 401: Unauthorized (no valid session)
 * - 404: Deck not found or user doesn't have access
 * - 500: Internal server error
 */
export const PATCH: APIRoute = async ({ locals, params, request }) => {
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
      validatedData = UpdateDeckSchema.parse(body);
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

    // Initialize service and update deck
    const deckService = new DeckService(locals.supabase);
    const updatedDeck = await deckService.updateDeckName(deckId, validatedData.name);

    // Check if deck was found and updated
    if (!updatedDeck) {
      return new Response(
        JSON.stringify({
          error: "Not found",
          message: "Deck not found or you don't have access to it",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return updated deck
    return new Response(JSON.stringify(updatedDeck), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating deck:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
