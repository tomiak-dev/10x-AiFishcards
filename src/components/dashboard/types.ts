/**
 * Client-side types for Dashboard components
 */

/**
 * Status procesu generowania fiszek
 */
export type GeneratorStatus = "idle" | "loading" | "success" | "error";

/**
 * Propozycja fiszki z dodatkowym polem klienckim 'accepted'
 */
export interface FlashcardProposal {
  id: string; // Tymczasowe ID po stronie klienta
  front: string;
  back: string;
  accepted: boolean; // Domyślnie true
  originalFront: string; // Oryginalna wartość przodu dla śledzenia edycji
  originalBack: string; // Oryginalna wartość tyłu dla śledzenia edycji
}

/**
 * Struktura błędu API
 */
export interface ApiError {
  message: string;
  status?: number; // Kod statusu HTTP
}
