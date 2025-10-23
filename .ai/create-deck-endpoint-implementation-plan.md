# API Endpoint Implementation Plan: Create Deck

## 1. Przegląd punktu końcowego
Endpoint `POST /api/decks` umożliwia utworzenie nowej talii (deck) wraz z zestawem początkowych fiszek (flashcards) w jednej operacji.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- URL: `/api/decks`

### Parametry
- Wymagane:
  - `name` (string): Nazwa tworzonej talii.
  - `flashcards` (array of object): Lista fiszek do utworzenia razem z talią.
    - `front` (string): Tekst przedniej strony fiszki (max 200 znaków).
    - `back` (string): Tekst tylnej strony fiszki (max 500 znaków).

### Przykład request body
```json
{
  "name": "Nowa Talia",
  "flashcards": [
    { "front": "Pytanie 1", "back": "Odpowiedź 1" },
    { "front": "Pytanie 2", "back": "Odpowiedź 2" }
  ]
}
```

## 3. Wykorzystywane typy
- DTO / Zod schema:
  - `CreateDeckDTO` (zod): walidacja `name` i `flashcards`.
  - `FlashcardInputDTO` (zod): walidacja elementów tablicy.
- TypeScript interfaces:
  - `CreateDeckCommand` (przekazywany do serwisu).
  - `DeckEntity` i `FlashcardEntity` (zwracane z bazy).

## 4. Szczegóły odpowiedzi
- **201 Created**: Powodzenie.
  ```json
  {
    "id": "uuid-talii",
    "name": "Nowa Talia",
    "created_at": "2025-10-15T12:34:56Z"
  }
  ```
- **400 Bad Request**: Błąd walidacji. Zwraca `{"error":"Validation failed","details": [ ... ]}`.
- **401 Unauthorized**: Brak lub nieważny token.
- **500 Internal Server Error**: Nieoczekiwany błąd serwera.

## 5. Przepływ danych
1. Middleware weryfikuje token JWT i dostarcza obiekt `supabase` w `context.locals`.
2. Endpoint parsuje i waliduje body za pomocą zod (`CreateDeckDTO`).
3. Wywołanie metody `deckService.createDeck(command)`:
   - Rozpoczęcie transakcji w Supabase.
   - `insert` do tabeli `decks` z `user_id` pobranym z sesji.
   - `bulk insert` do tabeli `flashcards` z `deck_id` i `creation_source='manual'`.
   - Commit transakcji.
4. Zwrot odpowiedzi 201 z nową talią.

## 6. Względy bezpieczeństwa
- Autoryzacja: weryfikacja JWT (Supabase Auth).
- Row-Level Security: RLS w bazie gwarantuje, że użytkownik zapisuje dane tylko we własnym kontekście.
- Walidacja wejścia: zod chroni przed wstrzyknięciami i niepoprawnym formatem.

## 7. Obsługa błędów
- **ZodError** → `400 Bad Request` + szczegóły walidacji.
- **AuthError** → `401 Unauthorized`.
- **DatabaseError** (violations, duplicate) → `400` lub `500` zależnie od typu, logowanie błędu.
- Nieznane wyjątki → `500 Internal Server Error`, zapis do logów.

## 8. Rozważania dotyczące wydajności
- Jednolite zapytanie z transakcją minimalizuje opóźnienia.
- Bulk insert flashcards zamiast wielokrotnych insertów.

## 9. Kroki implementacji
1. Utworzyć plik endpointu: `src/pages/api/decks/index.ts`.
2. Zdefiniować Zod schemy w `src/lib/schemas`:
   - `CreateDeckDTO` i `FlashcardInputDTO`.
3. W `src/lib/services/deck-service.ts`:
   - Dodać metodę `createDeck(command: CreateDeckCommand)`, implementując transakcję w Supabase.
4. W endpointzie:
   - Wyciągnąć sesję i `supabase` z `locals`.
   - Parsować i walidować body.
   - Wywołać `deckService.createDeck`.
   - Obsłużyć możliwe wyjątki i zwrócić odpowiedni kod.
5. Dodać testy jednostkowe i integracyjne dla endpointu.
6. Zaktualizować dokumentację w `api-plan.md`.
7. Wdrążyć i zweryfikować działanie manualnie oraz automatycznie.

