# Plan implementacji widoku talii (Decks)

## 1. Przegląd
Widok talii składa się z dwóch głównych ekranów: listy wszystkich talii użytkownika (`/decks`) oraz widoku szczegółów pojedynczej talii (`/decks/{deckId}`). Umożliwia on przeglądanie, tworzenie, edytowanie i usuwanie talii oraz zarządzanie zawartymi w nich fiszkami.

- **Lista talii (`/decks`)**: Wyświetla responsywną siatkę kart reprezentujących talie. Zapewnia podstawowe informacje (nazwa, data utworzenia, liczba fiszek) oraz akcje (nauka, edycja, usunięcie). Obsługuje stany ładowania i pusty.
- **Szczegóły talii (`/decks/{deckId}`)**: Prezentuje szczegółowe informacje o talii, listę jej fiszek oraz zaawansowane opcje zarządzania, takie jak edycja nazwy talii, dodawanie/edycja/usuwanie fiszek.

## 2. Routing widoku
- **Lista talii**: `/decks`
- **Szczegóły talii**: `/decks/[deckId]` (parametr dynamiczny `deckId`)
- **Tworzenie nowej talii**: `/decks/new` (przekierowanie do strony tworzenia)
- **Sesja nauki**: `/decks/[deckId]/study` (przekierowanie do widoku nauki)

## 3. Struktura komponentów
Implementacja będzie oparta o architekturę "smart-dumb components". Strony Astro (`.astro`) będą pełnić rolę "smart" kontenerów, zarządzając stanem i logiką, podczas gdy komponenty React (`.tsx`) będą "dumb" komponentami UI.

```
/src/pages/decks/index.astro (Strona listy talii)
└── /src/components/views/DecksView.tsx (Główny komponent widoku listy)
    ├── /src/components/ui/button.tsx (Przycisk "Utwórz nową talię")
    ├── /src/components/DecksList.tsx (Komponent listy/siatki talii)
    │   ├── /src/components/DeckCard.tsx (Karta pojedynczej talii)
    │   │   ├── /src/components/ui/card.tsx
    │   │   └── /src/components/ui/button.tsx (Przyciski akcji)
    │   └── /src/components/ui/skeleton.tsx (Stan ładowania)
    └── /src/components/EmptyState.tsx (Stan pusty)

/src/pages/decks/[deckId].astro (Strona szczegółów talii)
└── /src/components/views/DeckDetailsView.tsx (Główny komponent widoku szczegółów)
    ├── /src/components/DeckHeader.tsx (Nagłówek z nazwą i akcjami)
    │   └── /src/components/ui/button.tsx
    ├── /src/components/FlashcardsList.tsx (Lista fiszek)
    │   ├── /src/components/FlashcardRow.tsx (Wiersz/karta pojedynczej fiszki)
    │   └── /src/components/ui/skeleton.tsx (Stan ładowania)
    └── /src/components/modals/DeleteDeckModal.tsx (Modal potwierdzenia usunięcia)
```

## 4. Szczegóły komponentów

### DecksView.tsx
- **Opis**: Główny komponent widoku `/decks`. Odpowiada za pobieranie danych, zarządzanie stanem (ładowanie, błąd, dane) i renderowanie odpowiednich komponentów podrzędnych.
- **Główne elementy**: `DecksList`, `EmptyState`, przycisk nawigujący do `/decks/new`.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji, deleguje je do komponentów podrzędnych.
- **Typy**: `DeckSummaryDTO[]` do przekazania do `DecksList`.
- **Propsy**: Brak.

### DecksList.tsx
- **Opis**: Wyświetla siatkę kart talii (`DeckCard`) lub stan ładowania (szkielety).
- **Główne elementy**: Responsywny kontener `grid`, mapowanie po tablicy talii i renderowanie `DeckCard`, wyświetlanie komponentów `Skeleton` w stanie ładowania.
- **Obsługiwane interakcje**: Deleguje obsługę zdarzeń `onDelete` z `DeckCard` do `DecksView`.
- **Typy**: `DeckSummaryDTO[]`.
- **Propsy**:
  - `decks: DeckSummaryDTO[]`
  - `isLoading: boolean`
  - `onDelete: (deckId: string) => void`

### DeckCard.tsx
- **Opis**: Karta reprezentująca pojedynczą talię. Wyświetla kluczowe informacje i przyciski akcji.
- **Główne elementy**: Komponent `Card` z `shadcn/ui`, `CardHeader` z nazwą talii (jako link `<a>`), `CardContent` z datą i liczbą fiszek, `CardFooter` z przyciskami akcji.
- **Obsługiwane interakcje**:
  - Kliknięcie nazwy/karty: nawigacja do `/decks/{deckId}`.
  - Kliknięcie "Ucz się": nawigacja do `/decks/{deckId}/study`.
  - Kliknięcie "Edytuj": nawigacja do `/decks/{deckId}`.
  - Kliknięcie "Usuń": wywołanie `onDelete(deck.id)`.
- **Typy**: `DeckSummaryDTO`.
- **Propsy**:
  - `deck: DeckSummaryDTO`
  - `onDelete: (deckId: string) => void`

### DeckDetailsView.tsx
- **Opis**: Główny komponent widoku `/decks/{deckId}`. Pobiera szczegóły talii, zarządza stanem edycji i listy fiszek.
- **Główne elementy**: `DeckHeader`, `FlashcardsList`, `DeleteDeckModal`.
- **Obsługiwane interakcje**: Edycja nazwy talii, dodawanie/edycja/usuwanie fiszek, usuwanie całej talii.
- **Typy**: `DeckDetailsDTO`, `FlashcardDTO`.
- **Propsy**: `deckId: string`.

### FlashcardsList.tsx
- **Opis**: Wyświetla listę fiszek należących do talii. Obsługuje edycję inline i usuwanie.
- **Główne elementy**: Tabela lub lista, gdzie każdy wiersz to komponent `FlashcardRow`.
- **Obsługiwane interakcje**:
  - `onEdit(flashcardId, data)`: zapisuje zmiany w fiszce.
  - `onDelete(flashcardId)`: usuwa fiszkę.
- **Typy**: `FlashcardDTO[]`.
- **Propsy**:
  - `flashcards: FlashcardDTO[]`
  - `onEdit: (id: string, data: UpdateFlashcardCommand) => void`
  - `onDelete: (id: string) => void`

## 5. Typy
Większość typów DTO jest już zdefiniowana w `src/types.ts`. Nie przewiduje się potrzeby tworzenia nowych, złożonych typów ViewModel.

- **`DeckSummaryDTO`**: Używany w liście talii. Zawiera `id`, `name`, `created_at` oraz `flashcard_count` (wymaga dodania do typu i zapytania SQL).
- **`DeckDetailsDTO`**: Używany w widoku szczegółów. Zawiera `id`, `name`, `created_at`, `last_reviewed_at` oraz tablicę `flashcards: FlashcardDTO[]`.
- **`FlashcardDTO`**: Używany na liście fiszek w szczegółach talii.
- **`UpdateDeckCommand`**: Używany przy aktualizacji nazwy talii (`{ name: string }`).
- **`UpdateFlashcardCommand`**: Używany przy aktualizacji fiszki (`{ front: string, back: string }`).

## 6. Zarządzanie stanem
Zarządzanie stanem serwera (pobieranie danych, mutacje) zostanie zrealizowane przy użyciu biblioteki **TanStack Query (React Query)**.

- **`useDecks`**: Custom hook oparty na `useQuery` do pobierania listy talii (`GET /api/decks`). Będzie obsługiwał stany `isLoading`, `isError`, `data`.
- **`useDeckDetails`**: Custom hook oparty na `useQuery` do pobierania szczegółów talii (`GET /api/decks/{deckId}`).
- **`useUpdateDeck`**: Hook oparty na `useMutation` do aktualizacji nazwy talii (`PATCH /api/decks/{deckId}`). Po sukcesie unieważni zapytanie z `useDeckDetails`.
- **`useDeleteDeck`**: Hook oparty na `useMutation` do usuwania talii (`DELETE /api/decks/{deckId}`). Po sukcesie unieważni zapytanie z `useDecks`.
- **`useUpdateFlashcard`**, **`useDeleteFlashcard`**: Mutacje do zarządzania fiszkami, unieważniające zapytanie z `useDeckDetails`.

Lokalny stan UI (np. widoczność modala) będzie zarządzany za pomocą hooka `useState`.

## 7. Integracja API

- **`GET /api/decks`**: Pobieranie listy talii. Wywoływane przez hook `useDecks` przy montowaniu komponentu `DecksView`.
  - **Odpowiedź**: `ListDecksResponse` (`{ data: DeckSummaryDTO[], pagination: PaginationDTO }`).
- **`GET /api/decks/{deckId}`**: Pobieranie szczegółów talii. Wywoływane przez `useDeckDetails` w `DeckDetailsView`.
  - **Odpowiedź**: `DeckDetailsDTO`.
- **`DELETE /api/decks/{deckId}`**: Usuwanie talii. Wywoływane przez `useDeleteDeck` po potwierdzeniu w modalu.
  - **Odpowiedź**: `204 No Content` lub `200 OK`.
- **`PATCH /api/decks/{deckId}`**: Aktualizacja nazwy talii. Wywoływane przez `useUpdateDeck`.
  - **Żądanie**: `UpdateDeckCommand` (`{ name: string }`).
  - **Odpowiedź**: `DeckUpdatedDTO`.
- **`POST /api/decks/{deckId}/flashcards`**: Dodawanie nowej fiszki.
- **`PATCH /api/flashcards/{flashcardId}`**: Aktualizacja istniejącej fiszki.
- **`DELETE /api/flashcards/{flashcardId}`**: Usuwanie fiszki.

## 8. Interakcje użytkownika
- **Przeglądanie talii**: Kliknięcie na nazwę karty talii lub przycisk "Edytuj" przenosi do `/decks/{deckId}`.
- **Usuwanie talii**: Kliknięcie "Usuń" na karcie otwiera modal. Potwierdzenie w modalu wywołuje mutację usuwania, a następnie odświeża listę talii.
- **Edycja nazwy talii**: W widoku szczegółów, kliknięcie ikony edycji przy nazwie talii zamienia tekst na pole `input`. Zapisanie zmian wywołuje mutację `PATCH`.
- **Zarządzanie fiszkami**: Interakcje (edycja, usuwanie) w `FlashcardsList` wywołują odpowiednie mutacje, które po sukcesie odświeżają dane widoku szczegółów.

## 9. Warunki i walidacja
- **Nazwa talii**: Przy edycji nazwa nie może być pusta. Walidacja po stronie klienta przed wysłaniem żądania `PATCH`. Przycisk "Zapisz" jest nieaktywny, jeśli pole jest puste.
- **Treść fiszki**: Pola `front` i `back` nie mogą być puste i muszą przestrzegać limitów znaków (front: 200, back: 500). Walidacja odbywa się w formularzu edycji/dodawania fiszki.

## 10. Obsługa błędów
- **Błąd pobierania danych**: Komponenty `DecksView` i `DeckDetailsView` wyświetlą komunikat o błędzie, jeśli hooki `useQuery` zwrócą stan `isError`.
- **Błąd mutacji (np. usuwania)**: Użycie `onError` w `useMutation` do wyświetlenia powiadomienia (toast) z informacją o niepowodzeniu operacji (np. "Nie udało się usunąć talii").
- **Talia nie znaleziona (404)**: `useDeckDetails` obsłuży błąd 404, a komponent `DeckDetailsView` wyświetli stronę błędu lub przekieruje użytkownika do listy talii z odpowiednim komunikatem.
- **Brak autoryzacji (401)**: Middleware lub logika w `Astro.locals` powinna przekierować niezalogowanego użytkownika do strony logowania.

## 11. Kroki implementacji
1.  **Aktualizacja API i typów**: Zmodyfikować endpoint `GET /api/decks` i usługę `deck-service.ts`, aby dołączał `flashcard_count`. Zaktualizować typ `DeckSummaryDTO` w `src/types.ts`.
2.  **Utworzenie struktury plików**: Stworzyć puste pliki dla stron Astro (`/pages/decks/index.astro`, `/pages/decks/[deckId].astro`) oraz komponentów React (`DecksView.tsx`, `DeckCard.tsx` itd.).
3.  **Implementacja widoku listy talii (`/decks`)**:
    -   Stworzyć custom hook `useDecks` do pobierania danych z `GET /api/decks`.
    -   Zaimplementować komponent `DecksView.tsx`, który używa `useDecks` i renderuje `DecksList` lub `EmptyState`.
    -   Zaimplementować `DecksList.tsx` z obsługą stanu ładowania (szkielety).
    -   Zaimplementować `DeckCard.tsx` z linkami i przyciskami akcji.
    -   Zaimplementować logikę usuwania z użyciem `useDeleteDeck` i modala potwierdzającego.
4.  **Implementacja widoku szczegółów talii (`/decks/{deckId}`)**:
    -   Stworzyć custom hook `useDeckDetails` do pobierania danych z `GET /api/decks/{deckId}`.
    -   Zaimplementować `DeckDetailsView.tsx`, który używa `useDeckDetails`.
    -   Stworzyć komponent `DeckHeader.tsx` z logiką do edycji nazwy talii (inline) przy użyciu `useUpdateDeck`.
    -   Stworzyć komponent `FlashcardsList.tsx` i `FlashcardRow.tsx` do wyświetlania i zarządzania fiszkami.
    -   Zintegrować mutacje do dodawania, edycji i usuwania fiszek.
5.  **Stylowanie i responsywność**: Dopracować wygląd wszystkich komponentów zgodnie z opisem, używając Tailwind CSS, i zapewnić responsywność na różnych szerokościach ekranu.
6.  **Obsługa błędów i przypadków brzegowych**: Dodać obsługę błędów API, stanów pustych i ładowania we wszystkich odpowiednich miejscach.
7.  **Testowanie**: Przetestować manualnie wszystkie przepływy użytkownika, interakcje, walidację i obsługę błędów.

