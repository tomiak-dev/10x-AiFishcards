# API Endpoint Implementation Plan: Save AI-Generated Flashcards

## 1. Przegląd punktu końcowego
Endpoint `POST /api/ai/save` służy do tworzenia nowego zestawu fiszek (`deck`) na podstawie listy propozycji zaakceptowanych przez użytkownika. W ramach jednej transakcji bazodanowej tworzony jest nowy `deck` z automatycznie generowaną nazwą, zapisywane są fiszki (`flashcards`) oraz dodawany jest wpis do tabeli metryk (`ai_generation_metrics`).

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Ścieżka**: `/api/ai/save`
- **Nagłówki**:
  - `Authorization: Bearer <JWT>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "flashcards": [
      { "front": "Pytanie 1", "back": "Odpowiedź 1" }
    ],
    "metrics": {
      "proposed_flashcards_count": 15,
      "accepted_flashcards_count": 12,
      "edited_flashcards_count": 3
    }
  }
  ```

## 3. Wykorzystywane typy
- **DTO (Data Transfer Objects):**
  - `AiSaveRequestDTO`: Reprezentuje ciało żądania.
  - `AiSaveResponseDTO`: Reprezentuje odpowiedź sukcesu (`{ id, name, created_at }`).
- **Modele poleceń (Command Models):**
  - `CreateDeckFromAiCommand`: Przekazuje zweryfikowane dane do serwisu (`{ userId, flashcards, metrics }`).

## 4. Szczegóły odpowiedzi
- **201 Created**: Pomyślne utworzenie zasobów.
  ```json
  {
    "id": "new-deck-uuid",
    "name": "2025-10-15_10-30",
    "created_at": "iso-8601-timestamp"
  }
  ```
- **400 Bad Request**: Błąd walidacji (np. brakujące pola, nieprawidłowa długość tekstu).
  ```json
  { "error": "Validation failed", "details": [...] }
  ```
- **401 Unauthorized**: Brak lub nieważny token JWT.
- **500 Internal Server Error**: Błąd serwera, np. problem z transakcją bazodanową.
  ```json
  { "error": "Internal server error." }
  ```

## 5. Przepływ danych
1.  Middleware weryfikuje token JWT i dołącza `userId` do `context.locals`. Jeśli token jest nieważny, zwraca `401`. **Uwaga**: W fazie deweloperskiej, do czasu pełnej implementacji uwierzytelniania, będzie używany stały `DEFAULT_USER_UUID`.
2.  Handler API (`POST /api/ai/save`) odbiera żądanie.
3.  Ciało żądania jest walidowane za pomocą schemy `zod` zdefiniowanej w `src/lib/schemas/deck.schemas.ts`. W przypadku błędu zwracany jest status `400`.
4.  Handler tworzy obiekt polecenia `CreateDeckFromAiCommand` z `userId` i zweryfikowanymi danymi.
5.  Wywoływana jest metoda `DeckService.createDeckFromAiProposals(command)`.
6.  Serwis wykonuje transakcję bazodanową w Supabase:
    a. Generuje nazwę dla nowego `deck` w formacie `YYYY-MM-DD_HH-MM`.
    b. Wstawia nowy rekord do tabeli `decks`.
    c. Wstawia wszystkie fiszki z tablicy `flashcards`, przypisując im `deck_id` i `creation_source`.
    d. Wstawia rekord do tabeli `ai_generation_metrics`.
7.  Jeśli transakcja się powiedzie, serwis zwraca dane nowo utworzonego `deck`.
8.  Handler API formatuje odpowiedź do `AiSaveResponseDTO` i zwraca ją z kodem `201`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wszystkie żądania są chronione przez middleware, który weryfikuje token JWT z Supabase Auth. **Uwaga**: W fazie deweloperskiej, do czasu pełnej implementacji uwierzytelniania, będzie używany stały `DEFAULT_USER_UUID` zamiast `userId` z tokena.
- **Autoryzacja**: Logika biznesowa zapewnia, że `deck` i powiązane zasoby są tworzone w imieniu uwierzytelnionego użytkownika (`userId`). Dalszy dostęp będzie chroniony przez RLS.
- **Walidacja wejścia**: Użycie `zod` do walidacji wszystkich danych wejściowych zapobiega błędom przetwarzania i potencjalnym atakom (np. przez zbyt duże payloady).
- **Transakcyjność**: Użycie transakcji bazodanowej gwarantuje spójność danych. W przypadku błędu na którymkolwiek etapie (np. wstawianie fiszek), cała operacja jest wycofywana.

## 7. Obsługa błędów
- **Błędy walidacji (400)**: Obsługiwane przez `zod`, zwracają szczegółowe komunikaty o błędach.
- **Błędy autoryzacji (401)**: Obsługiwane przez middleware.
- **Błędy serwera (500)**: Wszelkie wyjątki rzucone w trakcie działania serwisu (np. błąd transakcji Supabase) będą przechwytywane w globalnym handlerze błędów, logowane za pomocą `console.error` i zwracana będzie generyczna odpowiedź `500`.

## 8. Rozważania dotyczące wydajności
- Operacje bazodanowe są zgrupowane w jednej transakcji, co minimalizuje liczbę zapytań sieciowych do bazy danych.
- Liczba fiszek w jednym żądaniu powinna być rozsądnie ograniczona na poziomie walidacji (np. do 100), aby uniknąć nadmiernego obciążenia bazy danych.

## 9. Kroki implementacji
1.  **Zaktualizować schemę walidacji**: W pliku `src/lib/schemas/deck.schemas.ts` dodać nowy schemat `AiSaveRequestSchema` do walidacji ciała żądania `POST /api/ai/save`.
2.  **Zaktualizować `DeckService`**: W pliku `src/lib/services/deck-service.ts` dodać nową metodę `createDeckFromAiProposals`, która będzie zawierać logikę transakcyjną opisaną w sekcji "Przepływ danych".
3.  **Utworzyć plik endpointu**: Stworzyć plik `src/pages/api/ai/save.ts`.
4.  **Zaimplementować handler API**: W pliku `save.ts` zaimplementować handler `POST`, który:
    - Odczytuje `userId` z `context.locals` (lub używa `DEFAULT_USER_UUID` w trybie deweloperskim).
    - Waliduje ciało żądania za pomocą `AiSaveRequestSchema`.
    - Wywołuje `DeckService.createDeckFromAiProposals`.
    - Obsługuje błędy i zwraca odpowiednie kody statusu.
    - W przypadku sukcesu zwraca odpowiedź `201 Created` z danymi nowego `deck`.
5.  **Dodać `prerender = false`**: Upewnić się, że plik `src/pages/api/ai/save.ts` eksportuje `export const prerender = false;` w celu zapewnienia dynamicznego renderowania.
6.  **Zaktualizować typy**: W pliku `src/types.ts` dodać definicje dla `AiSaveRequestDTO` i `AiSaveResponseDTO`.
