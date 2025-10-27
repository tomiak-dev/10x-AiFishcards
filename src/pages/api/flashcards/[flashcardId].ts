import type { APIRoute } from "astro";
import { FlashcardService } from "@/lib/services/flashcard-service.ts";
import { FlashcardIdSchema, UpdateFlashcardSchema } from "@/lib/schemas/flashcard.schemas.ts";
import { ZodError } from "zod";

export const prerender = false;

/**
 * PATCH /api/flashcards/{flashcardId}
 * Updates an existing flashcard
 *
 * Path Parameters:
 * - flashcardId: UUID of the flashcard to update
 *
 * Request Body:
 * - front: Updated front text
 * - back: Updated back text
 *
 * Response:
 * - 200: Flashcard updated successfully
 * - 400: Invalid request (bad flashcardId format or invalid body)
 * - 401: Unauthorized (no valid session)
 * - 404: Flashcard not found or user doesn't have access
 * - 500: Internal server error
 */
export const PATCH: APIRoute = async ({ locals, params, request }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract and validate flashcardId parameter
    const { flashcardId } = params;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Bad request",
          message: "Flashcard ID is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate flashcardId format (must be UUID)
    try {
      FlashcardIdSchema.parse(flashcardId);
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: "Invalid flashcard ID",
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
      validatedData = UpdateFlashcardSchema.parse(body);
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

    // Update flashcard
    const flashcardService = new FlashcardService(locals.supabase);
    const updatedFlashcard = await flashcardService.updateFlashcard(flashcardId, validatedData);

    // Check if flashcard was found and updated
    if (!updatedFlashcard) {
      return new Response(
        JSON.stringify({
          error: "Not found",
          message: "Flashcard not found or you don't have access to it",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return updated flashcard
    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating flashcard:", error);

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
 * DELETE /api/flashcards/{flashcardId}
 * Deletes a flashcard
 *
 * Path Parameters:
 * - flashcardId: UUID of the flashcard to delete
 *
 * Response:
 * - 204: Flashcard deleted successfully
 * - 400: Invalid flashcardId format
 * - 401: Unauthorized (no valid session)
 * - 404: Flashcard not found or user doesn't have access
 * - 500: Internal server error
 */
export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract and validate flashcardId parameter
    const { flashcardId } = params;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Bad request",
          message: "Flashcard ID is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate flashcardId format (must be UUID)
    try {
      FlashcardIdSchema.parse(flashcardId);
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: "Invalid flashcard ID",
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

    // Delete flashcard
    const flashcardService = new FlashcardService(locals.supabase);
    const deleted = await flashcardService.deleteFlashcard(flashcardId);

    // Check if flashcard was found and deleted
    if (!deleted) {
      return new Response(
        JSON.stringify({
          error: "Not found",
          message: "Flashcard not found or you don't have access to it",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return success with no content
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting flashcard:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
