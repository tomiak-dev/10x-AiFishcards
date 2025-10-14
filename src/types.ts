import type { Database } from "./db/database.types";

// ============================================================================
// Database Type Aliases
// ============================================================================

type Decks = Database["public"]["Tables"]["decks"]["Row"];
type Flashcards = Database["public"]["Tables"]["flashcards"]["Row"];
type AiGenerationMetrics = Database["public"]["Tables"]["ai_generation_metrics"]["Row"];

type Enums = Database["public"]["Enums"];

// ============================================================================
// Enums
// ============================================================================

export type CreationSourceEnum = Enums["creation_source_enum"];
export type ReviewQualityEnum = Enums["review_quality_enum"];

// ============================================================================
// Command Models (Request DTOs)
// ============================================================================

/**
 * Command for creating a new deck with initial flashcards
 * Used in: POST /api/decks
 */
export type CreateDeckCommand = {
  name: string;
  flashcards: Array<Pick<Flashcards, "front" | "back">>;
};

/**
 * Command for updating a deck's name
 * Used in: PATCH /api/decks/{deckId}
 */
export type UpdateDeckCommand = Pick<Decks, "name">;

/**
 * Command for adding a new flashcard to a deck
 * Used in: POST /api/decks/{deckId}/flashcards
 */
export type AddFlashcardCommand = Pick<Flashcards, "front" | "back">;

/**
 * Command for updating a flashcard's content
 * Used in: PATCH /api/flashcards/{flashcardId}
 */
export type UpdateFlashcardCommand = Pick<Flashcards, "front" | "back">;

/**
 * Command for generating AI flashcard proposals from text
 * Used in: POST /api/ai/generate
 */
export type GenerateFlashcardsCommand = {
  text: string;
};

/**
 * Command for saving AI-generated flashcards with metrics
 * Used in: POST /api/ai/save
 */
export type SaveAIFlashcardsCommand = {
  flashcards: Array<Pick<Flashcards, "front" | "back">>;
  metrics: Pick<
    AiGenerationMetrics,
    "proposed_flashcards_count" | "accepted_flashcards_count" | "edited_flashcards_count"
  >;
};

/**
 * Command for submitting a flashcard review with quality assessment
 * Used in: POST /api/reviews
 */
export type SubmitReviewCommand = {
  flashcard_id: string;
  quality: ReviewQualityEnum;
};

// ============================================================================
// Response DTOs - Common/Shared
// ============================================================================

/**
 * Pagination metadata for paginated responses
 */
export type PaginationDTO = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

/**
 * Summary information for a deck (used in lists)
 */
export type DeckSummaryDTO = Pick<Decks, "id" | "name" | "created_at" | "last_reviewed_at">;

/**
 * Basic flashcard information (used in deck details)
 */
export type FlashcardDTO = Pick<Flashcards, "id" | "front" | "back" | "created_at">;

/**
 * Flashcard information for review sessions
 */
export type ReviewFlashcardDTO = Pick<Flashcards, "id" | "front" | "back">;

/**
 * AI-generated flashcard proposal with temporary ID
 */
export type FlashcardProposalDTO = {
  id: string; // Temporary client-side ID
  front: string;
  back: string;
};

// ============================================================================
// Response DTOs - Decks
// ============================================================================

/**
 * Response for listing decks with pagination
 * Used in: GET /api/decks
 */
export type DeckListDTO = {
  data: DeckSummaryDTO[];
  pagination: PaginationDTO;
};

/**
 * Response for getting detailed deck information with all flashcards
 * Used in: GET /api/decks/{deckId}
 */
export type DeckDetailsDTO = Pick<Decks, "id" | "name" | "created_at" | "last_reviewed_at"> & {
  flashcards: FlashcardDTO[];
};

/**
 * Response after creating a new deck
 * Used in: POST /api/decks
 */
export type DeckCreatedDTO = Pick<Decks, "id" | "name" | "created_at">;

/**
 * Response after updating a deck
 * Used in: PATCH /api/decks/{deckId}
 */
export type DeckUpdatedDTO = Pick<Decks, "id" | "name">;

// ============================================================================
// Response DTOs - Flashcards
// ============================================================================

/**
 * Response after creating a new flashcard
 * Used in: POST /api/decks/{deckId}/flashcards
 */
export type FlashcardCreatedDTO = Pick<Flashcards, "id" | "deck_id" | "front" | "back" | "created_at">;

/**
 * Response after updating a flashcard
 * Used in: PATCH /api/flashcards/{flashcardId}
 */
export type FlashcardUpdatedDTO = Pick<Flashcards, "id" | "front" | "back" | "changed_at">;

// ============================================================================
// Response DTOs - AI Generation
// ============================================================================

/**
 * Response with AI-generated flashcard proposals
 * Used in: POST /api/ai/generate
 */
export type FlashcardProposalsDTO = {
  proposals: FlashcardProposalDTO[];
};

/**
 * Response after saving AI-generated flashcards to a new deck
 * Used in: POST /api/ai/save
 */
export type AISaveResponseDTO = Pick<Decks, "id" | "name" | "created_at">;

// ============================================================================
// Response DTOs - Reviews
// ============================================================================

/**
 * Response with flashcards due for review
 * Used in: GET /api/decks/{deckId}/review
 */
export type ReviewFlashcardsDTO = {
  flashcards: ReviewFlashcardDTO[];
};

/**
 * Response after submitting a flashcard review
 * Used in: POST /api/reviews
 */
export type ReviewResponseDTO = {
  flashcard_id: string;
  next_due_date: string; // From flashcard_srs_data.due_date (date string)
  new_interval: number; // From flashcard_srs_data.interval (days)
};
