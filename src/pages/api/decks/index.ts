import type { APIRoute } from "astro";
import { DeckService } from "../../../lib/services/deck-service";
import { ListDecksQuerySchema } from "../../../lib/schemas/deck.schemas";
import { ZodError } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

/**
 * GET /api/decks
 * Retrieves a paginated list of decks for the authenticated user
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - sortBy: Field to sort by (default: "created_at")
 * - order: Sort order "asc" or "desc" (default: "desc")
 */
export const GET: APIRoute = async ({ locals, url, cookies, request }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract and validate query parameters
    const queryParams = {
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      sortBy: url.searchParams.get("sortBy") ?? undefined,
      order: url.searchParams.get("order") ?? undefined,
    };

    let validatedParams;
    try {
      validatedParams = ListDecksQuerySchema.parse(queryParams);
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: "Invalid query parameters",
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

    // Initialize service and fetch decks
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const deckService = new DeckService(supabase);
    const response = await deckService.listDecks(validatedParams);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error listing decks:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
