import type { APIRoute } from "astro";
import { AiSaveRequestSchema } from "../../../lib/schemas/deck.schemas";
import { DeckService } from "../../../lib/services/deck-service";
import type { SaveAIFlashcardsCommand } from "../../../types";

export const prerender = false;

/**
 * POST /api/ai/save
 * Creates a new deck from AI-generated flashcard proposals
 *
 * Request body:
 * {
 *   "flashcards": [{ "front": "Question", "back": "Answer" }],
 *   "metrics": {
 *     "proposed_flashcards_count": 15,
 *     "accepted_flashcards_count": 12,
 *     "edited_flashcards_count": 3
 *   }
 * }
 *
 * Response: 201 Created
 * {
 *   "id": "deck-uuid",
 *   "name": "2025-10-15_10-30",
 *   "created_at": "iso-8601-timestamp"
 * }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body against schema
    const validationResult = AiSaveRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create command object from validated data
    const command: SaveAIFlashcardsCommand = {
      flashcards: validationResult.data.flashcards,
      metrics: validationResult.data.metrics,
    };

    // Call service to create deck from AI proposals
    const deckService = new DeckService(locals.supabase);
    const createdDeck = await deckService.createDeckFromAiProposals(command, locals.user.id);

    // Return success response
    return new Response(JSON.stringify(createdDeck), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error in POST /api/ai/save:", error);

    // Return generic error response
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
