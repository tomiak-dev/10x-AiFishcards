import { z } from "zod";

/**
 * Schema for validating deck ID parameter in review endpoint
 * Used in: GET /api/decks/{deckId}/review
 */
export const getDeckReviewParamsSchema = z.object({
  deckId: z.string().uuid({ message: "Invalid deck ID format" }),
});

/**
 * Schema for validating review submission request
 * Used in: POST /api/reviews
 */
export const submitReviewSchema = z.object({
  flashcard_id: z.string().uuid({ message: "Invalid flashcard ID format" }),
  quality: z.enum(["again", "good", "easy"], {
    errorMap: () => ({ message: "Quality must be one of 'again', 'good', 'easy'" }),
  }),
});

export type GetDeckReviewParamsDTO = z.infer<typeof getDeckReviewParamsSchema>;
export type SubmitReviewDTO = z.infer<typeof submitReviewSchema>;
