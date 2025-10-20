import { z } from "zod";

/**
 * Schema for validating flashcard ID parameter
 * Used in: PATCH /api/flashcards/{flashcardId}, DELETE /api/flashcards/{flashcardId}
 */
export const FlashcardIdSchema = z.string().uuid("Flashcard ID must be a valid UUID");

/**
 * Schema for validating flashcard update request
 * Used in: PATCH /api/flashcards/{flashcardId}
 */
export const UpdateFlashcardSchema = z.object({
  front: z.string().min(1, "Front text is required").max(200, "Front text must not exceed 200 characters"),
  back: z.string().min(1, "Back text is required").max(500, "Back text must not exceed 500 characters"),
});

/**
 * Schema for validating flashcard addition request
 * Used in: POST /api/decks/{deckId}/flashcards
 */
export const AddFlashcardSchema = z.object({
  front: z.string().min(1, "Front text is required").max(200, "Front text must not exceed 200 characters"),
  back: z.string().min(1, "Back text is required").max(500, "Back text must not exceed 500 characters"),
});

export type UpdateFlashcardDTO = z.infer<typeof UpdateFlashcardSchema>;
export type AddFlashcardDTO = z.infer<typeof AddFlashcardSchema>;
