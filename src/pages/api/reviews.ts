import type { APIRoute } from "astro";
import { submitReviewSchema } from "../../lib/schemas/review-schemas";
import { submitReview } from "../../lib/services/review-service";
import type { SubmitReviewCommand, ReviewResponseDTO } from "../../types";
import { ZodError } from "zod";

export const prerender = false;

/**
 * POST /api/reviews
 * Submits a review for a flashcard and updates SRS data using SM-2 algorithm
 *
 * Request Body:
 * {
 *   "flashcard_id": "uuid-string",
 *   "quality": "again" | "good" | "easy"
 * }
 *
 * Response: 200 OK
 * {
 *   "flashcard_id": "uuid-string",
 *   "next_due_date": "2025-10-25",
 *   "new_interval": 6
 * }
 *
 * Status Codes:
 * - 200: Review submitted successfully
 * - 400: Invalid request body (bad flashcard_id or quality)
 * - 401: Unauthorized (no valid session)
 * - 404: Flashcard not found or user doesn't have access
 * - 500: Internal server error
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

    // Parse request body
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

    // Validate request body
    let validated: SubmitReviewCommand;
    try {
      validated = submitReviewSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: "Invalid input",
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

    // Submit review
    const result: ReviewResponseDTO = await submitReview(
      locals.supabase,
      locals.user.id,
      validated.flashcard_id,
      validated.quality
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error && error.message === "Flashcard not found") {
      return new Response(
        JSON.stringify({
          error: "Flashcard not found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error instanceof Error && error.message.includes("Failed to update")) {
      console.error("Database error in POST /api/reviews:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to update review data",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error in POST /api/reviews:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
