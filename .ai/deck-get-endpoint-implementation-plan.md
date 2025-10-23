# API Endpoint Implementation Plan: Get Deck Details

## Przegląd punktu końcowego

Ten punkt końcowy pobiera szczegóły określonej talii (deck), w tym wszystkie powiązane z nią fiszki (flashcards). Dostęp jest ograniczony do talii należących do uwierzytelnionego użytkownika, zgodnie z polityką RLS (Row-Level Security) w Supabase.

## Szczegóły żądania

- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/decks/{deckId}`
- **Parametry**:
    - **Wymagane**:
        - `deckId` (parametr ścieżki): Identyfikator UUID talii do pobrania.
    - **Opcjonalne**: Brak.
- **Request Body**: Brak.

## Wykorzystywane typy

- `DeckDetailsDto` (z `src/types.ts`): Obiekt transferu danych reprezentujący szczegóły talii wraz z listą fiszek.
- `FlashcardDto` (z `src/types.ts`): Obiekt transferu danych dla pojedynczej fiszki.
- `DeckIdSchema` (z `src/lib/schemas/deck.schemas.ts`): Schemat `zod` do walidacji parametru `deckId`.

## Szczegóły odpowiedzi

- **Odpowiedź sukcesu (200 OK)**:
    ```json
    {
      "id": "uuid-string",
      "name": "Deck Name",
      "created_at": "iso-8601-timestamp",
      "last_reviewed_at": "iso-8601-timestamp",
      "flashcards": [
        {
          "id": "uuid-string",
          "front": "Front of the card",
          "back": "Back of the card",
          "created_at": "iso-8601-timestamp"
        }
      ]
    }
    ```
- **Odpowiedzi błędów**:
    - `400 Bad Request`: Jeśli `deckId` ma nieprawidłowy format (np. nie jest UUID).
    - `401 Unauthorized`: Jeśli użytkownik nie jest uwierzytelniony (brak lub nieprawidłowy token JWT).
    - `404 Not Found`: Jeśli talia o podanym `deckId` nie istnieje lub użytkownik nie ma do niej dostępu.
    - `500 Internal Server Error`: W przypadku nieoczekiwanych błędów serwera, np. problemów z połączeniem z bazą danych.

## Przepływ danych

1.  Żądanie `GET` jest wysyłane na adres `/api/decks/{deckId}`.
2.  Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, weryfikuje token JWT i dołącza klienta Supabase oraz sesję użytkownika do `context.locals`.
3.  Handler endpointu (`src/pages/api/decks/[deckId].ts`) jest wywoływany.
4.  Handler waliduje parametr `deckId` przy użyciu schematu `zod`.
5.  Handler wywołuje funkcję `getDeckDetails(deckId, supabase)` z `DeckService`.
6.  `DeckService` wykonuje zapytanie do bazy danych Supabase, aby pobrać talię i zagnieżdżone fiszki jednym zapytaniem (`decks` z `flashcards`). Polityka RLS automatycznie filtruje wyniki, aby zwrócić tylko dane należące do bieżącego użytkownika.
7.  Jeśli zapytanie nie zwróci żadnych danych, `DeckService` zwraca `null`.
8.  Handler sprawdza wynik z serwisu:
    - Jeśli `null`, zwraca odpowiedź `404 Not Found`.
    - Jeśli dane zostały znalezione, zwraca odpowiedź `200 OK` z danymi talii w formacie `DeckDetailsDto`.

## Względy bezpieczeństwa

- **Uwierzytelnianie**: Zapewnione przez middleware Astro, które weryfikuje token JWT Supabase. Nieautoryzowane żądania są odrzucane z kodem `401`.
- **Autoryzacja**: Wymuszana przez polityki RLS w PostgreSQL. Zapytania do bazy danych automatycznie filtrują dane na podstawie `user_id` powiązanego z sesją, co zapobiega dostępowi do danych innych użytkowników.
- **Walidacja danych wejściowych**: Parametr `deckId` jest walidowany jako UUID przy użyciu `zod`, co chroni przed atakami typu SQL Injection i błędami zapytań.

## Obsługa błędów

- **Błąd walidacji `deckId`**: Zwraca `400 Bad Request` z komunikatem o błędzie walidacji.
- **Brak sesji użytkownika**: Middleware zwraca `401 Unauthorized`.
- **Talia nieznaleziona**: `DeckService` zwraca `null`, co powoduje zwrócenie przez handler odpowiedzi `404 Not Found`.
- **Błąd bazy danych**: Każde zapytanie do Supabase jest opakowane w blok `try...catch`. W przypadku błędu zapytania, jest on logowany, a do klienta wysyłana jest odpowiedź `500 Internal Server Error`.

## Rozważania dotyczące wydajności

- **Zapytanie do bazy danych**: Dane talii i jej fiszek są pobierane za pomocą jednego zapytania do bazy danych, co minimalizuje liczbę rund do bazy i poprawia wydajność.
- **Indeksowanie**: Kolumna `decks.id` jest kluczem głównym, co zapewnia szybkie wyszukiwanie. Kolumna `flashcards.deck_id` powinna być zindeksowana, aby przyspieszyć złączenie.

## Etapy wdrożenia

1.  **Utworzenie pliku endpointu**: Stwórz nowy plik `src/pages/api/decks/[deckId].ts`.
2.  **Zdefiniowanie schematu walidacji**: W pliku `src/lib/schemas/deck.schemas.ts` dodaj `DeckIdSchema` do walidacji `deckId` jako string w formacie UUID.
3.  **Implementacja logiki w serwisie**: W `src/lib/services/deck-service.ts` dodaj nową asynchroniczną funkcję `getDeckDetails(deckId: string, supabase: SupabaseClient)`. Funkcja ta powinna:
    - Przyjmować `deckId` i instancję `SupabaseClient`.
    - Wykonywać zapytanie `select('*, flashcards(*)')` do tabeli `decks`.
    - Filtrować wyniki za pomocą `.eq('id', deckId)`.
    - Używać `.single()` do pobrania pojedynczego rekordu.
    - Zwracać znaleziony obiekt talii lub `null`, jeśli nic nie znaleziono.
4.  **Implementacja handlera GET**: W pliku `[deckId].ts` zaimplementuj handler `GET`:
    - Pobierz `deckId` z `params`.
    - Pobierz `supabase` z `context.locals`.
    - Przeprowadź walidację `deckId` za pomocą `DeckIdSchema.safeParse()`. W przypadku błędu zwróć `400`.
    - Wywołaj `deckService.getDeckDetails()` z `deckId` i `supabase`.
    - Jeśli wynik jest `null`, zwróć `404`.
    - Jeśli dane istnieją, zwróć `200` z danymi w formacie JSON.
    - Opakuj logikę w blok `try...catch` do obsługi błędów serwera.
5.  **Aktualizacja typów**: Upewnij się, że typy `DeckDetailsDto` i `FlashcardDto` w `src/types.ts` odpowiadają strukturze odpowiedzi.
6.  **Testowanie**: Utwórz testy weryfikujące:
    - Poprawne pobieranie danych dla istniejącej talii.
    - Zwracanie `404` dla nieistniejącej talii.
    - Zwracanie `400` dla nieprawidłowego `deckId`.
    - Zwracanie `401` dla żądania bez tokenu JWT.

