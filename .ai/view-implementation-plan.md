# API Endpoint Implementation Plan: Generate Flashcard Proposals

## 1. Przegląd punktu końcowego
Endpoint `POST /api/ai/generate` służy do wygenerowania propozycji fiszek na podstawie dużego bloku tekstu (2000–10000 znaków). Zwraca listę tymczasowych propozycji fiszek.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Ścieżka: `/api/ai/generate`
- Nagłówki:
  - `Authorization: Bearer <JWT>`
  - `Content-Type: application/json`
- Parametry:
  - Wymagane:
    - `body.text` (string): 2000–10000 znaków
  - Opcjonalne: brak
- Request Body:
  ```json
  {
    "text": "..."  
  }
  ```

## 3. Wykorzystywane typy
- DTO:
  - `AiGenerateRequestDTO { text: string }`
  - `ProposalDTO { id: string; front: string; back: string }`
  - `AiGenerateResponseDTO { proposals: ProposalDTO[] }`

## 4. Szczegóły odpowiedzi
- 200 OK:
  ```json
  {
    "proposals": [ { id, front, back }, ... ]
  }
  ```
- 400 Bad Request: niepoprawna długość tekstu lub brak pola
  ```json
  { "error": "Text must be between 2000 and 10000 characters." }
  ```
- 401 Unauthorized: brak lub nieważny JWT
- 503 Service Unavailable: błąd zewnętrznej usługi AI
  ```json
  { "error": "AI service is currently unavailable. Please try again later." }
  ```
- 500 Internal Server Error: nieoczekiwany błąd serwera
  ```json
  { "error": "Internal server error." }
  ```

## 5. Przepływ danych
1. Middleware sprawdza JWT i zapisuje `userId` w `context.locals`.
2. Handler API odbiera JSON, waliduje `text` za pomocą Zod.
3. Wywołanie metody `AiService.generateFlashcards(text, userId)`:
   - Wysyła zapytanie do wewnętrznej/usługowej warstwy AI.
   - Mapuje surową odpowiedź AI na `ProposalDTO[]`.
4. Zwraca `AiGenerateResponseDTO` z kodem 200.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: JWT z Supabase Auth, weryfikacja w middleware.
- Autoryzacja: RLS w Supabase gwarantuje, że dane zapytań użytkownika są izolowane.
- Sanitizacja wejścia: walidacja tekstu Zod, brak potencjalnych XSS.
- Ograniczanie wielkości payload: max. 10000 znaków.

## 7. Obsługa błędów
- 400: walidacja Zod, błędna długość tekstu.
- 401: middleware wykrywa brak/nieważny token.
- 503: błąd przy komunikacji z zewnętrzną usługą AI.
- 500: nieprzewidziany wyjątek, logowanie błędu.

## 8. Rozważania dotyczące wydajności
- Ograniczenie długości tekstu zapobiega nadmiernym obciążeniom.
- Asynchroniczna obsługa połączeń z usługą AI.
- Opcja cache’owania odpowiedzi dla identycznych zapytań (opcjonalnie).

## 9. Kroki implementacji
1. Utworzyć plik `src/pages/api/ai/generate.ts`.
2. Zdefiniować Zod schema dla `AiGenerateRequestDTO` i `AiGenerateResponseDTO`.
3. Utworzyć `src/lib/services/ai-service.ts` z metodą `generateFlashcards(text: string, userId: string)`.
4. W handlerze API:
   - Uwierzytelniać użytkownika przez middleware.
   - Walidować request body.
   - Wywołać `AiService.generateFlashcards`.
   - Zweryfikować i sformatować odpowiedź.
   - Zwrócić JSON z odpowiednim kodem.
5. Dodać testy jednostkowe dla:
   - Walidacji Zod.
   - Logiki mapowania odpowiedzi AI.
8. Zaktualizować dokumentację API w repozytorium.

