# Plan implementacji widoku Dashboard

## 1. Przegląd
Widok Dashboard to główny interfejs aplikacji, który umożliwia zalogowanym użytkownikom generowanie zestawów fiszek na podstawie dostarczonego tekstu przy użyciu AI. Użytkownik może wkleić tekst, wygenerować propozycje fiszek, przejrzeć je, edytować, a następnie zapisać jako nową talię. Widok obsługuje różne stany interfejsu, takie jak ładowanie, błędy i sukces, zapewniając płynne i intuicyjne doświadczenie.

## 2. Routing widoku
Widok będzie dostępny pod główną ścieżką aplikacji: `/` (lub opcjonalnie `/dashboard`). Implementacja znajdzie się w pliku `src/pages/index.astro`.

## 3. Struktura komponentów
Komponenty zostaną zaimplementowane w React (`.tsx`) ze względu na ich dynamiczny i interaktywny charakter. Główny komponent `DashboardView` będzie zarządzał stanem i logiką, delegując zadania do mniejszych, wyspecjalizowanych komponentów.

```
src/pages/index.astro
└── src/components/views/DashboardView.tsx (komponent kliencki)
    ├── src/components/dashboard/AiGeneratorForm.tsx
    │   ├── ui/textarea.tsx
    │   ├── ui/button.tsx
    │   └── (elementy HTML dla licznika i walidacji)
    ├── src/components/dashboard/ProposalsList.tsx
    │   ├── ui/button.tsx
    │   └── src/components/dashboard/ProposalCard.tsx
    │       ├── ui/checkbox.tsx
    │       ├── ui/textarea.tsx
    │       └── ui/button.tsx (ikona kosza)
    └── (komponenty dla stanów ładowania i błędów, np. Skeleton, Alert)
```

## 4. Szczegóły komponentów

### `DashboardView.tsx`
- **Opis**: Główny komponent orkiestrujący cały widok. Zarządza stanem (wprowadzany tekst, status generowania, propozycje fiszek, błędy) i komunikacją z API.
- **Główne elementy**: Renderuje warunkowo `AiGeneratorForm`, `ProposalsList`, skeleton loadery lub komunikaty o błędach w zależności od aktualnego stanu.
- **Obsługiwane interakcje**:
  - Przekazuje `onGenerate` do `AiGeneratorForm`.
  - Przekazuje `onSave` do `ProposalsList`.
  - Zarządza aktualizacją i usuwaniem propozycji z listy.
- **Typy**: `FlashcardProposal`, `ApiError`, `GeneratorStatus`.
- **Propsy**: Brak.

### `AiGeneratorForm.tsx`
- **Opis**: Formularz do wprowadzania tekstu i inicjowania generowania fiszek.
- **Główne elementy**: `Textarea` dla tekstu źródłowego, licznik znaków, komunikat walidacji, przycisk "Generuj fiszki".
- **Obsługiwane interakcje**:
  - `onChange` na `Textarea`: aktualizuje stan tekstu i licznika znaków.
  - `onClick` na przycisku "Generuj fiszki": wywołuje `onGenerate` z przekazaniem tekstu.
- **Obsługiwana walidacja**:
  - Długość tekstu: 2000-10000 znaków. Przycisk "Generuj" jest wyłączony, jeśli warunek nie jest spełniony.
  - Licznik znaków zmienia kolor: szary (<2000), zielony (2000-10000), czerwony (>10000).
- **Typy**: `GeneratorStatus`.
- **Propsy**:
  - `onGenerate: (text: string) => void`
  - `status: GeneratorStatus`

### `ProposalsList.tsx`
- **Opis**: Wyświetla listę wygenerowanych propozycji fiszek i pozwala na ich zapisanie.
- **Główne elementy**: Nagłówek z liczbą propozycji, przycisk "Zapisz jako talię", przewijalna lista komponentów `ProposalCard`.
- **Obsługiwane interakcje**:
  - `onClick` na przycisku "Zapisz jako talię": wywołuje `onSave` z listą zaakceptowanych fiszek.
  - Przekazuje `onUpdate` i `onRemove` do każdej `ProposalCard`.
- **Obsługiwana walidacja**: Przycisk "Zapisz" jest wyłączony, jeśli żadna fiszka nie jest zaznaczona.
- **Typy**: `FlashcardProposal[]`.
- **Propsy**:
  - `proposals: FlashcardProposal[]`
  - `onSave: (acceptedProposals: FlashcardProposal[]) => void`
  - `onUpdate: (id: string, updatedProposal: FlashcardProposal) => void`
  - `onRemove: (id: string) => void`
  - `status: GeneratorStatus`

### `ProposalCard.tsx`
- **Opis**: Reprezentuje pojedynczą, edytowalną propozycję fiszki.
- **Główne elementy**: `Checkbox` do akceptacji, `Textarea` dla przodu i tyłu fiszki, liczniki znaków, komunikaty walidacji, przycisk "Usuń".
- **Obsługiwane interakcje**:
  - `onCheckedChange` na `Checkbox`: aktualizuje stan `accepted`.
  - `onChange` na `Textarea`: aktualizuje treść przodu/tyłu fiszki.
  - `onClick` na przycisku "Usuń": wywołuje `onRemove`.
- **Obsługiwana walidacja**:
  - Przód: max 200 znaków.
  - Tył: max 500 znaków.
  - Liczniki znaków i komunikaty o błędach wyświetlane po przekroczeniu limitów.
- **Typy**: `FlashcardProposal`.
- **Propsy**:
  - `proposal: FlashcardProposal`
  - `onUpdate: (id: string, updatedProposal: FlashcardProposal) => void`
  - `onRemove: (id: string) => void`

## 5. Typy
Do implementacji widoku potrzebne będą następujące typy:

```typescript
// Status procesu generowania fiszek
export type GeneratorStatus = 'idle' | 'loading' | 'success' | 'error';

// Propozycja fiszki z dodatkowym polem klienckim 'accepted'
export interface FlashcardProposal {
  id: string; // Tymczasowe ID po stronie klienta
  front: string;
  back: string;
  accepted: boolean; // Domyślnie true
}

// Struktura błędu API
export interface ApiError {
  message: string;
  status?: number; // Kod statusu HTTP
}

// DTO dla żądania POST /api/ai/generate
export interface GenerateProposalsRequest {
  text: string;
}

// DTO dla odpowiedzi z POST /api/ai/generate
export interface GenerateProposalsResponse {
  proposals: {
    id: string;
    front: string;
    back: string;
  }[];
}

// DTO dla żądania POST /api/ai/save
export interface SaveProposalsRequest {
  flashcards: {
    front: string;
    back: string;
  }[];
  metrics: {
    proposed_flashcards_count: number;
    accepted_flashcards_count: number;
    edited_flashcards_count: number;
  };
}

// DTO dla odpowiedzi z POST /api/ai/save
export interface SaveProposalsResponse {
  id: string; // ID nowej talii
  name: string;
  created_at: string;
}
```

## 6. Zarządzanie stanem
Zarządzanie stanem zostanie zrealizowane w głównym komponencie `DashboardView.tsx` przy użyciu hooków `useState` i `useCallback` z Reacta. Nie ma potrzeby wprowadzania zewnętrznej biblioteki do zarządzania stanem.

Kluczowe zmienne stanu:
- `text: string`: Przechowuje tekst źródłowy z `Textarea`.
- `proposals: FlashcardProposal[]`: Lista wygenerowanych propozycji.
- `status: GeneratorStatus`: Aktualny stan procesu generowania (`idle`, `loading`, `success`, `error`).
- `error: ApiError | null`: Obiekt błędu w przypadku niepowodzenia.

Logika biznesowa (wywołania API, obsługa stanu) zostanie zamknięta w `DashboardView.tsx` i przekazana do komponentów podrzędnych jako propsy.

## 7. Integracja API

### Generowanie propozycji
- **Endpoint**: `POST /api/ai/generate`
- **Akcja**: Wywoływana po kliknięciu przycisku "Generuj fiszki".
- **Request Body**: `GenerateProposalsRequest` (`{ text: string }`)
- **Response Body (Success)**: `GenerateProposalsResponse` (`{ proposals: [...] }`)
- **Obsługa**: Po otrzymaniu odpowiedzi, dane są mapowane na typ `FlashcardProposal[]` (z `accepted: true`), a stan `proposals` i `status` są aktualizowane.

### Zapisywanie talii
- **Endpoint**: `POST /api/ai/save`
- **Akcja**: Wywoływana po kliknięciu przycisku "Zapisz jako talię".
- **Request Body**: `SaveProposalsRequest` (`{ flashcards: [...], metrics: {...} }`)
- **Response Body (Success)**: `SaveProposalsResponse` (`{ id: string, ... }`)
- **Obsługa**: Po pomyślnym zapisaniu, użytkownik jest przekierowywany do widoku nowej talii (`/decks/{deckId}`) przy użyciu `window.location.href`, a na ekranie pojawia się komunikat typu "Toast".

## 8. Interakcje użytkownika
- **Wprowadzanie tekstu**: Użytkownik wkleja tekst, a licznik znaków i walidacja działają w czasie rzeczywistym.
- **Generowanie fiszek**: Kliknięcie przycisku "Generuj fiszki" blokuje formularz i wyświetla stan ładowania.
- **Recenzja propozycji**: Użytkownik może edytować tekst fiszek, odznaczać je (odrzucać) lub usuwać z listy.
- **Zapisywanie talii**: Kliknięcie "Zapisz jako talię" wysyła tylko zaakceptowane fiszki do API i przekierowuje użytkownika.
- **Obsługa błędów**: W przypadku błędu API, użytkownik widzi stosowny komunikat i przycisk "Spróbuj ponownie".

## 9. Warunki i walidacja
- **Formularz generowania (`AiGeneratorForm`)**:
  - Przycisk "Generuj fiszki" jest aktywny tylko wtedy, gdy długość tekstu w `Textarea` mieści się w przedziale 2000-10000 znaków.
- **Lista propozycji (`ProposalsList`)**:
  - Przycisk "Zapisz jako talię" jest aktywny tylko wtedy, gdy co najmniej jedna fiszka jest zaznaczona (`accepted: true`).
- **Karta propozycji (`ProposalCard`)**:
  - Pola `Textarea` dla przodu i tyłu fiszki wyświetlają błąd walidacji (np. czerwona ramka, komunikat), jeśli długość tekstu przekracza odpowiednio 200 lub 500 znaków.

## 10. Obsługa błędów
- **Błędy walidacji po stronie klienta**: Obsługiwane bezpośrednio w komponentach poprzez wyłączanie przycisków i wyświetlanie komunikatów.
- **Błędy API (`/api/ai/generate`)**:
  - `400 Bad Request`: Komunikat "Tekst zawiera nieprawidłowe znaki lub jest za krótki/długi".
  - `503 Service Unavailable`: Komunikat "Usługa AI jest chwilowo niedostępna. Spróbuj ponownie za chwilę.".
  - **Błąd sieci/Timeout**: Komunikat "Utracono połączenie z siecią" lub "Generowanie trwa zbyt długo".
  - W każdym przypadku błędu API wyświetlany jest przycisk "Spróbuj ponownie".
- **Błędy API (`/api/ai/save`)**: W przypadku błędu zapisu wyświetlany jest komunikat "Toast" z informacją o niepowodzeniu.

## 11. Kroki implementacji
1. **Utworzenie struktury plików**: Stworzenie plików dla komponentów: `DashboardView.tsx`, `AiGeneratorForm.tsx`, `ProposalsList.tsx`, `ProposalCard.tsx` w odpowiednich katalogach.
2. **Implementacja `AiGeneratorForm`**: Zbudowanie formularza z `Textarea`, licznikiem znaków i logiką walidacji długości tekstu.
3. **Implementacja `ProposalCard`**: Stworzenie karty dla pojedynczej propozycji z polami edytowalnymi, checkboxem i walidacją.
4. **Implementacja `ProposalsList`**: Zbudowanie listy, która renderuje `ProposalCard` i zawiera przycisk do zapisu talii.
5. **Implementacja `DashboardView`**:
   - Zintegrowanie wszystkich komponentów.
   - Dodanie logiki zarządzania stanem (`useState`).
   - Implementacja funkcji obsługujących wywołania API (`handleGenerate`, `handleSave`) z użyciem `fetch`.
   - Dodanie warunkowego renderowania dla stanów `loading` (np. skeleton loader) i `error` (komunikat błędu).
6. **Integracja z Astro**: Umieszczenie komponentu `<DashboardView client:load />` w pliku `src/pages/index.astro`.
7. **Stylowanie**: Ostylowanie wszystkich komponentów przy użyciu Tailwind CSS i komponentów `shadcn/ui` (`Button`, `Textarea`, `Checkbox` itp.).
8. **Testowanie**: Ręczne przetestowanie całego przepływu: generowanie, edycja, odrzucanie, zapisywanie oraz obsługa przypadków błędów.
9. **Finalizacja**: Dodanie obsługi Toastów dla potwierdzenia zapisu lub błędów zapisu.

