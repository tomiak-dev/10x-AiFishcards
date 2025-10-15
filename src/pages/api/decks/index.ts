import type { APIRoute } from "astro";
import { CreateDeckSchema } from "../../../lib/schemas/deck.schemas";
import { DeckService } from "../../../lib/services/deck-service";
import { ZodError } from "zod";

export const prerender = false;

/**
 * POST /api/decks
 * Creates a new deck with initial flashcards
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is authenticated (via middleware)
    if (!locals.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateDeckSchema.parse(body);

    // Create deck with flashcards
    const deckService = new DeckService(locals.supabase);
    const createdDeck = await deckService.createDeck(validatedData, locals.userId);

    return new Response(JSON.stringify(createdDeck), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle other errors
    console.error("Error creating deck:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
