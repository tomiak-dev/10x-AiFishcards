# Plan implementacji widoku Sesji Nauki

## 1. Przegląd
Widok sesji nauki (`/decks/{deckId}/study`) umożliwia użytkownikowi przeprowadzenie sesji powtórek dla wybranej talii fiszek. Wykorzystuje algorytm SM-2 do określania, które fiszki wymagają powtórki. Użytkownik ocenia każdą fiszkę, a system dynamicznie przechodzi do kolejnej. Po zakończeniu sesji wyświetlane jest modalne podsumowanie z wynikami.

## 2. Routing widoku
- **Ścieżka Astro**: `src/pages/decks/[deckId]/study.astro`
- **URL**: `/decks/{deckId}/study`

Strona będzie renderowana po stronie serwera (`prerender = false`), aby dynamicznie pobierać `deckId` i dane sesji.

## 3. Struktura komponentów
Komponenty będą zaimplementowane w React, aby zapewnić interaktywność wymaganą podczas sesji nauki.

```
- study.astro (Strona Astro)
  - StudyViewWithProvider.tsx (Wrapper z React Query)
    - StudyView.tsx (Główny komponent widoku)
      - StudyHeader.tsx (Nagłówek z postępem i przyciskiem zakończenia)
      - FlashcardView.tsx (Komponent wyświetlający fiszkę)
      - StudyControls.tsx (Przyciski oceny: "Nie wiem", "Wiem", "Bardzo łatwe")
      - SessionSummaryModal.tsx (Modal podsumowujący sesję)
      - EmptyState.tsx (Komunikat o braku fiszek do nauki)
      - LoadingSpinner.tsx (Wskaźnik ładowania)
      - ErrorDisplay.tsx (Komunikat o błędzie)
```

## 4. Szczegóły komponentów

### `StudyView.tsx`
- **Opis**: Główny komponent orkiestrujący całą sesję nauki. Zarządza stanem sesji, pobiera dane, obsługuje interakcje i renderuje odpowiednie komponenty podrzędne w zależności od stanu (ładowanie, błąd, aktywna sesja, brak fiszek).
- **Główne elementy**: `StudyHeader`, `FlashcardView`, `StudyControls`, `SessionSummaryModal` oraz logika warunkowa do ich wyświetlania.
- **Obsługiwane interakcje**:
  - Inicjalizacja pobierania fiszek do powtórki.
  - Obsługa kliknięcia "Pokaż odpowiedź".
  - Obsługa wyboru oceny i wysłanie jej do API.
  - Przejście do następnej fiszki.
  - Wyświetlenie podsumowania po ostatniej fiszce.
  - Obsługa zakończenia sesji.
- **Typy**: `StudySessionState`, `ReviewFlashcardDTO`, `Deck`.
- **Propsy**: `deckId: string`, `deckName: string`.

### `StudyHeader.tsx`
- **Opis**: Wyświetla informacje o postępie sesji oraz przycisk do jej przerwania.
- **Główne elementy**: `div` z tekstem (`Nazwa talii`, `Fiszka X z Y`), opcjonalnie komponent `ProgressBar` z `shadcn/ui`, `Button` ("Zakończ sesję").
- **Obsługiwane interakcje**: Kliknięcie przycisku "Zakończ sesję" emituje zdarzenie `onEndSession`.
- **Typy**: Brak specyficznych.
- **Propsy**: `deckName: string`, `currentCardIndex: number`, `totalCards: number`, `onEndSession: () => void`.

### `FlashcardView.tsx`
- **Opis**: Wyświetla aktualną fiszkę. Ma dwa stany: widoczny tylko przód lub widoczny przód i tył.
- **Główne elementy**: Komponent `Card` z `shadcn/ui`. Wewnątrz `div` z tekstem przodu (`front`) i warunkowo renderowany `div` z tekstem tyłu (`back`) oraz separator `<hr />`.
- **Obsługiwane interakcje**: Brak, komponent czysto prezentacyjny.
- **Typy**: `ReviewFlashcardDTO`.
- **Propsy**: `flashcard: ReviewFlashcardDTO`, `isRevealed: boolean`.

### `StudyControls.tsx`
- **Opis**: Zawiera przyciski akcji dla użytkownika: "Pokaż odpowiedź" lub zestaw przycisków oceny.
- **Główne elementy**: `Button` ("Pokaż odpowiedź") lub grupa trzech `Button`ów ("Nie wiem", "Wiem", "Bardzo łatwe").
- **Obsługiwane interakcje**:
  - Kliknięcie "Pokaż odpowiedź" emituje `onReveal`.
  - Kliknięcie przycisku oceny emituje `onRate` z odpowiednią wartością `quality`.
- **Typy**: `ReviewQualityEnum`.
- **Propsy**: `isRevealed: boolean`, `onReveal: () => void`, `onRate: (quality: ReviewQualityEnum) => void`, `isSubmitting: boolean`.

### `SessionSummaryModal.tsx`
- **Opis**: Modal wyświetlany po ukończeniu wszystkich fiszek w sesji. Pokazuje statystyki.
- **Główne elementy**: Komponent `Dialog` z `shadcn/ui`. Zawiera nagłówek, tekst podsumowania (np. "Przejrzane fiszki: X", "Poprawne odpowiedzi: Y%") oraz przyciski akcji.
- **Obsługiwane interakcje**:
  - Kliknięcie "Zamknij" emituje `onClose`.
  - Kliknięcie "Rozpocznij ponownie" emituje `onRestart`.
- **Typy**: `SessionStats`.
- **Propsy**: `isOpen: boolean`, `stats: SessionStats`, `onClose: () => void`, `onRestart: () => void`.

## 5. Typy

```typescript
// Nowe typy ViewModel potrzebne dla widoku

/**
 * Reprezentuje stan sesji nauki po stronie klienta.
 */
export type StudySessionState = {
  status: 'loading' | 'ready' | 'error' | 'empty' | 'finished';
  flashcards: ReviewFlashcardDTO[];
  currentCardIndex: number;
  isRevealed: boolean;
  stats: SessionStats;
};

/**
 * Statystyki zakończonej sesji nauki.
 */
export type SessionStats = {
  total: number;
  again: number;
  good: number;
  easy: number;
};

// Istniejące typy DTO, które będą używane

/**
 * Fiszka w sesji nauki (z `src/types.ts`).
 * Używane do pobierania i wyświetlania fiszek.
 */
// ReviewFlashcardDTO = { id: string; front: string; back: string; };

/**
 * Jakość oceny (z `src/types.ts`).
 * Używane przy wysyłaniu oceny do API.
 */
// ReviewQualityEnum = "again" | "good" | "easy";

/**
 * Payload żądania POST /api/reviews (z `src/types.ts`).
 */
// SubmitReviewCommand = { flashcard_id: string; quality: ReviewQualityEnum; };

/**
 * Odpowiedź z POST /api/reviews (z `src/types.ts`).
 */
// ReviewResponseDTO = { flashcard_id: string; next_due_date: string; new_interval: number; };
```

## 6. Zarządzanie stanem
Stan sesji nauki będzie zarządzany w komponencie `StudyView.tsx` przy użyciu hooka `useState` lub `useReducer` dla bardziej złożonej logiki. Dodatkowo, zostanie stworzony customowy hook `useStudySession`, który będzie enkapsulował całą logikę.

### `useStudySession(deckId: string)`
- **Cel**: Abstrakcja logiki sesji nauki, w tym pobieranie danych, zarządzanie stanem, obsługa ocen i nawigacja między fiszkami.
- **Zarządzany stan (`StudySessionState`)**:
  - `status`: Aktualny stan sesji (`loading`, `ready`, `error`, `empty`, `finished`).
  - `flashcards`: Lista fiszek do powtórki.
  - `currentCardIndex`: Indeks aktualnie wyświetlanej fiszki.
  - `isRevealed`: Flaga, czy odpowiedź na fiszce jest widoczna.
  - `stats`: Statystyki sesji (`SessionStats`).
- **Zwracane wartości i funkcje**:
  - `state: StudySessionState`: Aktualny stan sesji.
  - `currentFlashcard: ReviewFlashcardDTO | undefined`: Aktualna fiszka.
  - `revealAnswer: () => void`: Funkcja do odsłaniania odpowiedzi.
  - `submitReview: (quality: ReviewQualityEnum) => Promise<void>`: Funkcja do wysyłania oceny.
  - `endSession: () => void`: Funkcja do zakończenia sesji.
  - `restartSession: () => void`: Funkcja do restartu sesji.
  - `isLoading: boolean`: Flaga ładowania danych z API.
  - `isSubmitting: boolean`: Flaga wysyłania oceny.

## 7. Integracja API

- **Pobieranie fiszek do nauki**:
  - **Endpoint**: `GET /api/decks/{deckId}/review`
  - **Akcja**: Wywoływane przy inicjalizacji komponentu `StudyView.tsx` za pomocą `useQuery` z `@tanstack/react-query`.
  - **Typ odpowiedzi**: `ReviewFlashcardsDTO` (`{ flashcards: ReviewFlashcardDTO[] }`).
  - **Obsługa sukcesu**: Stan `status` zmienia się na `ready` (jeśli są fiszki) lub `empty` (jeśli lista jest pusta). Fiszki są zapisywane w stanie.
  - **Obsługa błędu**: Stan `status` zmienia się na `error`.

- **Zapisywanie oceny fiszki**:
  - **Endpoint**: `POST /api/reviews`
  - **Akcja**: Wywoływane po kliknięciu przycisku oceny w `StudyControls.tsx` za pomocą `useMutation` z `@tanstack/react-query`.
  - **Typ żądania**: `SubmitReviewCommand` (`{ flashcard_id: string; quality: ReviewQualityEnum; }`).
  - **Typ odpowiedzi**: `ReviewResponseDTO`.
  - **Obsługa sukcesu**: Statystyki sesji są aktualizowane, a system przechodzi do następnej fiszki. Jeśli to ostatnia fiszka, stan `status` zmienia się na `finished`.
  - **Obsługa błędu**: Wyświetlany jest toast (np. `sonner`) z informacją o błędzie. Użytkownik pozostaje na tej samej fiszce z możliwością ponowienia oceny.

## 8. Interakcje użytkownika
- **Rozpoczęcie sesji**: Użytkownik nawiguje do `/decks/{deckId}/study`. System automatycznie próbuje pobrać fiszki.
- **Odsłonięcie odpowiedzi**:
  - Użytkownik klika "Pokaż odpowiedź" lub naciska `Space`/`Enter`.
  - Stan `isRevealed` zmienia się na `true`. Widok fiszki się aktualizuje, a przyciski oceny stają się widoczne. Focus przenosi się na pierwszy przycisk oceny.
- **Ocena fiszki**:
  - Użytkownik klika jeden z trzech przycisków oceny lub naciska klawisze `1`, `2`, `3`.
  - Wywoływana jest mutacja `POST /api/reviews`.
  - Po sukcesie, `currentCardIndex` jest inkrementowany, a `isRevealed` resetowane do `false`. Następuje animowane przejście do kolejnej fiszki.
- **Zakończenie sesji (przycisk)**:
  - Użytkownik klika "Zakończ sesję".
  - Wyświetla się modal potwierdzający. Po potwierdzeniu, użytkownik jest przekierowywany do `/decks/{deckId}`.
- **Zakończenie sesji (naturalne)**:
  - Po ocenie ostatniej fiszki, stan `status` zmienia się na `finished`.
  - Wyświetlany jest `SessionSummaryModal`.
- **Nawigacja w modalu podsumowania**:
  - Kliknięcie "Zamknij" przekierowuje do `/decks/{deckId}`.
  - Kliknięcie "Rozpocznij ponownie" resetuje stan i rozpoczyna nową sesję.

## 9. Warunki i walidacja
- **Brak fiszek do nauki**: Jeśli `GET /api/decks/{deckId}/review` zwróci pustą tablicę, `StudyView` wyświetli komponent `EmptyState` z komunikatem "Świetna robota! Nie masz fiszek do powtórki." i przyciskiem powrotu.
- **Koniec sesji**: Po ocenie ostatniej fiszki (`currentCardIndex === flashcards.length - 1`), system przechodzi w stan `finished` i wyświetla modal podsumowania.
- **Próba odświeżenia strony**: Stan sesji (indeks, lista fiszek) będzie przechowywany w `sessionStorage`, aby umożliwić wznowienie sesji po odświeżeniu strony. Hook `useStudySession` będzie odpowiedzialny za synchronizację z `sessionStorage`.

## 10. Obsługa błędów
- **Błąd pobierania fiszek**:
  - Komponent `StudyView` wyświetli komponent `ErrorDisplay` z komunikatem "Nie udało się pobrać fiszek. Spróbuj ponownie." i przyciskiem do ponowienia próby (`refetch` z `useQuery`).
- **Błąd zapisu oceny**:
  - Mutacja `POST /api/reviews` w `onError` wyświetli toast (np. `sonner`) z komunikatem "Nie udało się zapisać oceny. Spróbuj ponownie.".
  - Aplikacja pozostanie na tej samej fiszce, umożliwiając użytkownikowi ponowną próbę oceny. Przycisk oceny nie będzie w stanie `loading`.
- **Brak autoryzacji (401)**: Middleware Astro (`src/middleware/index.ts`) powinno przechwycić brak sesji i przekierować na stronę logowania, więc ten błąd nie powinien dotrzeć do komponentu.

## 11. Kroki implementacji
1.  **Utworzenie strony Astro**: Stworzyć plik `src/pages/decks/[deckId]/study.astro`. Dodać w nim podstawową strukturę, pobrać `deckId` i `deckName` (np. przez dodatkowe zapytanie do API lub przekazanie w `Astro.props`) i wyrenderować komponent `StudyViewWithProvider`.
2.  **Stworzenie komponentów React**: Utworzyć wszystkie wymienione w strukturze komponenty React (`StudyViewWithProvider`, `StudyView`, `StudyHeader`, `FlashcardView`, `StudyControls`, `SessionSummaryModal`) w katalogu `src/components/study/`.
3.  **Implementacja `useStudySession`**: Stworzyć custom hook `useStudySession` w `src/components/hooks/`, który będzie zawierał logikę pobierania danych (`useQuery`), wysyłania ocen (`useMutation`) oraz zarządzania stanem sesji. Dodać obsługę `sessionStorage`.
4.  **Implementacja `StudyView`**: Zintegrować hook `useStudySession` z komponentem `StudyView`. Dodać logikę warunkowego renderowania w zależności od `state.status`.
5.  **Stylowanie komponentów**: Ostylować wszystkie komponenty za pomocą Tailwind CSS i komponentów `shadcn/ui` (`Card`, `Button`, `Dialog`, `Progress`), dbając o responsywność.
6.  **Obsługa interakcji**: Dodać obsługę zdarzeń `onClick` i `onKeyDown` (dla skrótów klawiszowych) w `StudyControls`.
7.  **Implementacja modalu podsumowania**: Zaimplementować `SessionSummaryModal` z przekazywaniem statystyk i obsługą akcji zamknięcia/restartu.
8.  **Obsługa stanów krańcowych**: Zaimplementować widoki dla stanów `loading`, `error` i `empty`.
9.  **Testowanie i poprawki**: Przetestować cały przepływ, włączając w to błędy API, brak fiszek, odświeżanie strony i nawigację. Dopracować animacje przejść między fiszkami.
10. **Dostępność (a11y)**: Dodać atrybuty ARIA (`aria-live` dla postępu, `role="dialog"` dla modali) i zarządzać focusem, aby zapewnić zgodność z WCAG.

