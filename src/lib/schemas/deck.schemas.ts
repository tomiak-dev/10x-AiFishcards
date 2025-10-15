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

/**
 * Schema for validating AI generation metrics
 */
export const AiMetricsSchema = z.object({
  proposed_flashcards_count: z.number().int().min(0, "Proposed count must be non-negative"),
  accepted_flashcards_count: z.number().int().min(0, "Accepted count must be non-negative"),
  edited_flashcards_count: z.number().int().min(0, "Edited count must be non-negative"),
});

/**
 * Schema for validating AI save request (POST /api/ai/save)
 */
export const AiSaveRequestSchema = z.object({
  flashcards: z
    .array(FlashcardInputSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Cannot save more than 100 flashcards at once"),
  metrics: AiMetricsSchema,
});

export type CreateDeckDTO = z.infer<typeof CreateDeckSchema>;
export type FlashcardInputDTO = z.infer<typeof FlashcardInputSchema>;
export type AiSaveRequestDTO = z.infer<typeof AiSaveRequestSchema>;
export type AiMetricsDTO = z.infer<typeof AiMetricsSchema>;
