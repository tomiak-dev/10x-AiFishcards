import type { ResponseFormat } from "./openrouter-service.types";

/**
 * Common JSON schemas for structured responses from OpenRouter
 */

/**
 * Schema for flashcard proposals generation
 * Used by ai-service.ts to generate FlashcardProposalDTO
 */
export const flashcardProposalsSchema: ResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "FlashcardProposalsResponse",
    strict: true,
    schema: {
      type: "object",
      properties: {
        flashcards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              front: { type: "string" },
              back: { type: "string" },
            },
            required: ["front", "back"],
            additionalProperties: false,
          },
        },
      },
      required: ["flashcards"],
      additionalProperties: false,
    },
  },
};
