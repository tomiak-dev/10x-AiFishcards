import { z } from "zod";

/**
 * Schema for validating individual flashcard input
 */
export const FlashcardInputSchema = z.object({
  front: z.string().min(1, "Front text is required").max(200, "Front text must not exceed 200 characters"),
  back: z.string().min(1, "Back text is required").max(500, "Back text must not exceed 500 characters"),
});

/**
 * Schema for validating deck creation request
 */
export const CreateDeckSchema = z.object({
  name: z.string().min(1, "Deck name is required").max(100, "Deck name must not exceed 100 characters"),
  flashcards: z
    .array(FlashcardInputSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Cannot create more than 100 flashcards at once"),
});

export type CreateDeckDTO = z.infer<typeof CreateDeckSchema>;
export type FlashcardInputDTO = z.infer<typeof FlashcardInputSchema>;
