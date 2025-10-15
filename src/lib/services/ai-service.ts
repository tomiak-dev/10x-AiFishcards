import type { FlashcardProposalDTO } from "@/types.ts";
import { nanoid } from "nanoid";

/**
 * Service for AI-powered flashcard generation
 */

/**
 * Generates flashcard proposals from provided text using AI
 *
 * @param text - The input text to generate flashcards from (2000-10000 characters)
 * @param userId - The ID of the user requesting the generation
 * @returns Array of flashcard proposals with temporary IDs
 * @throws Error if AI service is unavailable or returns invalid data
 */
export async function generateFlashcards(text: string, userId: string): Promise<FlashcardProposalDTO[]> {
  try {
    // TODO: Integrate with actual AI service (e.g., OpenAI, Anthropic)
    // For now, this is a placeholder implementation

    // Simulate AI service call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock AI response - in production, this would call an external AI API
    const mockProposals: Array<{ front: string; back: string }> = [
      {
        front: "What is the main topic discussed in the text?",
        back: "The text discusses various aspects of the subject matter provided.",
      },
      {
        front: "Key concept from the text",
        back: "Important information extracted from the provided content.",
      },
    ];

    // Map AI response to FlashcardProposalDTO format with temporary IDs
    const proposals: FlashcardProposalDTO[] = mockProposals.map((proposal) => ({
      id: nanoid(), // Generate temporary client-side ID
      front: proposal.front,
      back: proposal.back,
    }));

    // Log generation for debugging (in production, consider proper logging)
    console.log(`Generated ${proposals.length} flashcard proposals for user ${userId}`);

    return proposals;
  } catch (error) {
    // Handle errors from AI service
    console.error("Error in generateFlashcards:", error);

    // Re-throw with a user-friendly message
    throw new Error("AI service is currently unavailable. Please try again later.");
  }
}
