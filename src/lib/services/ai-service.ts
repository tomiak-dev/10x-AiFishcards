import type { FlashcardProposalDTO } from "@/types.ts";
import { nanoid } from "nanoid";
import { OpenRouterService } from "./openrouter-service.ts";
import { flashcardProposalsSchema } from "./openrouter-service.schemas.ts";

/**
 * Service for AI-powered flashcard generation
 */

// Initialize OpenRouter service (singleton pattern)
let openRouterService: OpenRouterService | null = null;

function getOpenRouterService(): OpenRouterService {
  if (!openRouterService) {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured in environment variables");
    }

    openRouterService = new OpenRouterService({
      apiKey,
      defaultModel: "openai/gpt-4o-mini", // Fast and cost-effective model
    });
  }

  return openRouterService;
}

/**
 * Generates flashcard proposals from provided text using AI
 *
 * @param text - The input text to generate flashcards from (2000-10000 characters)
 * @param userId - The ID of the user requesting the generation
 * @returns Array of flashcard proposals with temporary IDs
 * @throws Error if AI service is unavailable or returns invalid data
 */
export async function generateFlashcards(text: string, userId: string): Promise<FlashcardProposalDTO[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Input text cannot be empty");
  }

  if (text.length < 100) {
    throw new Error("Input text is too short. Please provide at least 100 characters.");
  }

  if (text.length > 10000) {
    throw new Error("Input text is too long. Maximum length is 10000 characters.");
  }

  try {
    const openRouter = getOpenRouterService();

    // Prepare messages for the LLM
    const messages = [
      {
        role: "system" as const,
        content: `You are an expert at creating educational flashcards. Your task is to analyze the provided text and generate high-quality flashcards that help users learn and remember key concepts.

Guidelines for creating flashcards:
1. Each flashcard should focus on a single concept or fact
2. Questions (front) should be clear, specific, and answerable
3. Answers (back) should be concise but complete
4. Avoid yes/no questions - prefer "what", "how", "why" questions
5. Include important definitions, concepts, relationships, and key facts
6. Generate between 5-15 flashcards depending on text length and complexity
7. Ensure variety in question types (definitions, explanations, applications)

Return the flashcards in the specified JSON format.`,
      },
      {
        role: "user" as const,
        content: `Generate flashcards from the following text:\n\n${text}`,
      },
    ];

    // Call OpenRouter API with structured output
    const response = await openRouter.sendMessage(messages, {
      responseFormat: flashcardProposalsSchema,
    });

    // Validate response structure
    if (!response?.flashcards || !Array.isArray(response.flashcards)) {
      throw new Error("Invalid response format from AI service");
    }

    if (response.flashcards.length === 0) {
      throw new Error("AI service did not generate any flashcards. Try providing more detailed text.");
    }

    // Map AI response to FlashcardProposalDTO format with temporary IDs
    const proposals: FlashcardProposalDTO[] = response.flashcards.map((card: { front: string; back: string }) => ({
      id: nanoid(), // Generate temporary client-side ID
      front: card.front.trim(),
      back: card.back.trim(),
    }));

    // Log generation for debugging (in production, consider proper logging)
    console.log(`Generated ${proposals.length} flashcard proposals for user ${userId}`);

    return proposals;
  } catch (error) {
    // Handle errors from AI service
    console.error("Error in generateFlashcards:", error);

    // Re-throw with appropriate error message based on error type
    if (error instanceof Error) {
      // If it's already a formatted error, pass it through
      if (
        error.message.includes("OPENROUTER_API_KEY") ||
        error.message.includes("Invalid response format") ||
        error.message.includes("did not generate any flashcards")
      ) {
        throw error;
      }

      // Handle specific OpenRouter errors
      if (error.name === "AuthError") {
        throw new Error("AI service authentication failed. Please check your API configuration.");
      }

      if (error.name === "RateLimitError") {
        throw new Error("AI service rate limit exceeded. Please try again in a few moments.");
      }

      if (error.name === "NetworkError") {
        throw new Error("Network error while connecting to AI service. Please check your connection and try again.");
      }

      if (error.name === "ApiError") {
        throw new Error("AI service encountered an error. Please try again later.");
      }
    }

    // Generic fallback error
    throw new Error("AI service is currently unavailable. Please try again later.");
  }
}
