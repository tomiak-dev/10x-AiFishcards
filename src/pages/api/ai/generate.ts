import type { APIRoute } from "astro";
import { z } from "zod";
import { generateFlashcards } from "@/lib/services/ai-service.ts";

export const prerender = false;

// Zod schema for request validation
const AiGenerateRequestSchema = z.object({
  text: z
    .string()
    .min(2000, "Text must be at least 2000 characters long.")
    .max(10000, "Text must be at most 10000 characters long."),
});

export const POST: APIRoute = async ({ request, locals }) => {
  // Authentication check - userId should be set by middleware
  const userId = locals.userId;

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse and validate request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON in request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate request data with Zod
  const validationResult = AiGenerateRequestSchema.safeParse(requestBody);

  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors[0]?.message || "Invalid request data.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { text } = validationResult.data;

  // Call AI service to generate flashcards
  try {
    const proposals = await generateFlashcards(text, userId);

    return new Response(JSON.stringify({ proposals }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle AI service errors
    if (error instanceof Error) {
      // Check if it's a service unavailable error
      if (error.message.includes("AI service") || error.message.includes("unavailable")) {
        return new Response(JSON.stringify({ error: "AI service is currently unavailable. Please try again later." }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Log unexpected errors
    console.error("Unexpected error in /api/ai/generate:", error);

    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
