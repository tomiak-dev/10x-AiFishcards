# API Endpoint Implementation Plan: Study Session (Reviews)

## 1. Przegląd punktów końcowych

Ten plan obejmuje implementację dwóch powiązanych punktów końcowych API odpowiedzialnych za zarządzanie sesjami nauki z wykorzystaniem algorytmu Spaced Repetition System (SRS) SM-2:

1. **GET /api/decks/{deckId}/review** - pobiera fiszki z danej talii, które są wymagane do powtórki (gdzie `due_date <= CURRENT_DATE`)
2. **POST /api/reviews** - zapisuje ocenę użytkownika dla danej fiszki i aktualizuje dane SRS zgodnie z algorytmem SM-2

Oba endpointy wymagają uwierzytelnienia i implementują autoryzację na poziomie serwisu, ponieważ RLS jest wyłączone w projekcie.

---

## 2. Szczegóły żądania

### Endpoint 1: GET /api/decks/{deckId}/review

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/decks/{deckId}/review`
- **Parametry**:
  - **Wymagane**:
    - `deckId` (UUID, path parameter) - identyfikator talii, z której pobierane są fiszki do powtórki
  - **Opcjonalne**: brak
- **Request Body**: brak (metoda GET)
- **Headers**:
  - `Authorization: Bearer <token>` - wymagany token JWT użytkownika

### Endpoint 2: POST /api/reviews

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/reviews`
- **Parametry**: brak parametrów w URL
- **Request Body** (JSON):
  ```json
  {
    "flashcard_id": "uuid-string",
    "quality": "good"
  }
  ```
  - `flashcard_id` (string, UUID) - identyfikator fiszki, która jest oceniana
  - `quality` (string, enum) - ocena użytkownika, możliwe wartości: `"again"`, `"good"`, `"easy"`
- **Headers**:
  - `Authorization: Bearer <token>` - wymagany token JWT użytkownika
  - `Content-Type: application/json`

---

## 3. Wykorzystywane typy

### Typy z `src/types.ts`

**Command Models (Request DTOs)**:
- `SubmitReviewCommand` (linia 75-78):
  ```typescript
  {
    flashcard_id: string;
    quality: ReviewQualityEnum;
  }
  ```

**Response DTOs**:
- `ReviewFlashcardsDTO` (linia 194-196):
  ```typescript
  {
    flashcards: ReviewFlashcardDTO[];
  }
  ```

- `ReviewFlashcardDTO` (linia 108):
  ```typescript
  Pick<Flashcards, "id" | "front" | "back">
  ```

- `ReviewResponseDTO` (linia 202-206):
  ```typescript
  {
    flashcard_id: string;
    next_due_date: string; // Date string (YYYY-MM-DD)
    new_interval: number;  // Days
  }
  ```

**Enums**:
- `ReviewQualityEnum` (linia 18): `"again" | "good" | "easy"`

### Zasoby bazodanowe

**View**:
- `flashcards_with_srs` - widok łączący dane fiszek z danymi SRS, zawiera:
  - `id`, `deck_id`, `front`, `back`, `created_at`, `creation_source`
  - `user_id`, `due_date`, `interval`, `repetition`, `efactor`

**Funkcja PostgreSQL**:
- `update_srs_data_on_review(p_flashcard_id UUID, p_quality review_quality_enum)` - implementuje algorytm SM-2 i aktualizuje dane SRS

---

## 4. Szczegóły odpowiedzi

### Endpoint 1: GET /api/decks/{deckId}/review

**Sukces (200 OK)**:
```json
{
  "flashcards": [
    {
      "id": "uuid-string-1",
      "front": "Pytanie na fiszce 1",
      "back": "Odpowiedź na fiszce 1"
    },
    {
      "id": "uuid-string-2",
      "front": "Pytanie na fiszce 2",
      "back": "Odpowiedź na fiszce 2"
    }
  ]
}
```

**Kody statusu**:
- `200 OK` - pomyślnie pobrano fiszki (może być pusta tablica, jeśli brak fiszek do powtórki)
- `401 Unauthorized` - brak lub nieprawidłowy token uwierzytelniający
- `404 Not Found` - talia nie istnieje lub użytkownik nie jest jej właścicielem

### Endpoint 2: POST /api/reviews

**Sukces (200 OK)**:
```json
{
  "flashcard_id": "uuid-string",
  "next_due_date": "2025-10-25",
  "new_interval": 6
}
```

**Kody statusu**:
- `200 OK` - pomyślnie zapisano ocenę i zaktualizowano dane SRS
- `400 Bad Request` - nieprawidłowa wartość `quality` lub `flashcard_id`
- `401 Unauthorized` - brak lub nieprawidłowy token uwierzytelniający
- `404 Not Found` - fiszka nie istnieje lub użytkownik nie ma do niej dostępu
- `500 Internal Server Error` - błąd wywołania funkcji bazodanowej

---

## 5. Przepływ danych

### Endpoint 1: GET /api/decks/{deckId}/review

```
1. Żądanie HTTP GET → /api/decks/{deckId}/review
2. Middleware (src/middleware/index.ts):
   - Ekstrahuje token z nagłówka Authorization
   - Weryfikuje token przez Supabase Auth
   - Ustawia context.locals.userId
3. Route handler (src/pages/api/decks/[deckId]/review.ts):
   - Waliduje deckId (UUID format)
   - Wywołuje review-service.getFlashcardsForReview()
4. Service layer (src/lib/services/review-service.ts):
   - Zapytanie do widoku flashcards_with_srs:
     WHERE deck_id = {deckId}
     AND user_id = {userId}
     AND due_date <= CURRENT_DATE
   - Rzuca błąd 404, jeśli brak uprawnień do talii
5. Route handler:
   - Mapuje dane do ReviewFlashcardsDTO
   - Zwraca odpowiedź 200 z danymi
```

### Endpoint 2: POST /api/reviews

```
1. Żądanie HTTP POST → /api/reviews
   Body: { flashcard_id, quality }
2. Middleware:
   - Weryfikuje token, ustawia context.locals.userId
3. Route handler (src/pages/api/reviews.ts):
   - Parsuje JSON z body
   - Waliduje przez Zod schema (flashcard_id format, quality enum)
   - Wywołuje review-service.submitReview()
4. Service layer (src/lib/services/review-service.ts):
   - Weryfikuje ownership fiszki (przez deck_id → user_id)
   - Wywołuje funkcję PostgreSQL:
     SELECT update_srs_data_on_review({flashcard_id}, {quality})
   - Pobiera zaktualizowane dane SRS (due_date, interval)
5. Route handler:
   - Mapuje dane do ReviewResponseDTO
   - Zwraca odpowiedź 200 z danymi
```

---

## 6. Względy bezpieczeństwa

### Uwierzytelnianie
- **Wymagane dla obu endpointów**: Token JWT w nagłówku `Authorization: Bearer <token>`
- **Middleware** automatycznie weryfikuje token i ustawia `context.locals.userId`
- **Fallback w development**: Używa `DEFAULT_USER_UUID` gdy brak tokenu (tylko dla testowania lokalnego)

### Autoryzacja
Ponieważ RLS jest wyłączone, **wszystkie sprawdzenia autoryzacji muszą być w service layer**:

1. **GET /api/decks/{deckId}/review**:
   - Sprawdzić, czy `user_id` w widoku `flashcards_with_srs` odpowiada `context.locals.userId`
   - Jeśli brak wyników lub user_id nie pasuje → 404 Not Found

2. **POST /api/reviews**:
   - Przed wywołaniem funkcji `update_srs_data_on_review`:
     - Zapytać `flashcards_with_srs` WHERE flashcard_id = {flashcard_id}
     - Sprawdzić, czy `user_id` odpowiada `context.locals.userId`
     - Jeśli nie → 404 Not Found (nie ujawniać, że fiszka istnieje)

### Walidacja danych wejściowych

**GET /api/decks/{deckId}/review**:
- Walidować `deckId` jako UUID (Zod: `z.string().uuid()`)
- Odrzucić żądania z nieprawidłowym formatem → 400 Bad Request

**POST /api/reviews**:
- Walidować `flashcard_id` jako UUID
- Walidować `quality` jako jeden z dozwolonych wartości enum: `again`, `good`, `easy`
- Schema Zod:
  ```typescript
  {
    flashcard_id: z.string().uuid(),
    quality: z.enum(['again', 'good', 'easy'])
  }
  ```

### Zapobieganie atakom

- **SQL Injection**: Używamy Supabase SDK z parametryzowanymi zapytaniami
- **Authorization bypass**: Zawsze sprawdzać `user_id` w service layer
- **Input tampering**: Ścisła walidacja Zod przed wykonaniem jakiejkolwiek logiki biznesowej
- **Information disclosure**: Nie ujawniać w błędach 404, czy zasób istnieje, ale użytkownik nie ma dostępu

---

## 7. Obsługa błędów

### Endpoint 1: GET /api/decks/{deckId}/review

| Kod statusu | Scenariusz | Przykładowa wiadomość |
|-------------|------------|----------------------|
| `200 OK` | Pomyślnie pobrano fiszki (może być pusta tablica) | `{ "flashcards": [] }` |
| `400 Bad Request` | Nieprawidłowy format `deckId` | `{ "error": "Invalid deck ID format" }` |
| `401 Unauthorized` | Brak lub nieprawidłowy token | `{ "error": "Unauthorized" }` |
| `404 Not Found` | Talia nie istnieje lub użytkownik nie jest właścicielem | `{ "error": "Deck not found" }` |
| `500 Internal Server Error` | Nieoczekiwany błąd bazy danych | `{ "error": "Internal server error" }` |

### Endpoint 2: POST /api/reviews

| Kod statusu | Scenariusz | Przykładowa wiadomość |
|-------------|------------|----------------------|
| `200 OK` | Pomyślnie zapisano ocenę | `{ "flashcard_id": "...", "next_due_date": "...", "new_interval": 6 }` |
| `400 Bad Request` | Nieprawidłowy `flashcard_id` lub `quality` | `{ "error": "Invalid input: quality must be one of 'again', 'good', 'easy'" }` |
| `401 Unauthorized` | Brak lub nieprawidłowy token | `{ "error": "Unauthorized" }` |
| `404 Not Found` | Fiszka nie istnieje lub użytkownik nie ma dostępu | `{ "error": "Flashcard not found" }` |
| `500 Internal Server Error` | Błąd wywołania funkcji bazodanowej | `{ "error": "Failed to update review data" }` |

### Strategia obsługi błędów w kodzie

**W route handlers**:
```typescript
try {
  // Validate input
  const validated = schema.parse(data);

  // Call service
  const result = await service.method(supabase, userId, validated);

  return new Response(JSON.stringify(result), { status: 200 });
} catch (error) {
  if (error instanceof z.ZodError) {
    return new Response(
      JSON.stringify({ error: "Invalid input", details: error.errors }),
      { status: 400 }
    );
  }

  if (error.message === 'Not found' || error.message === 'Deck not found') {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 404 }
    );
  }

  console.error('Unexpected error:', error);
  return new Response(
    JSON.stringify({ error: "Internal server error" }),
    { status: 500 }
  );
}
```

**W service layer**:
- Rzucać opisowe błędy dla specyficznych scenariuszy (np. `throw new Error('Deck not found')`)
- Pozwolić route handlerowi na mapowanie błędów do kodów statusu HTTP

---

## 8. Rozważania dotyczące wydajności

### Optymalizacje bazodanowe

1. **Użycie widoku `flashcards_with_srs`**:
   - Widok już łączy `flashcards`, `decks`, `flashcard_srs_data`
   - Eliminuje potrzebę ręcznego JOIN w aplikacji
   - Linie 173-192 w db-plan.md

2. **Indeksy**:
   - Index na `flashcard_srs_data.due_date` (linia 90 w db-plan.md) - przyspiesza filtrowanie po dacie
   - Index na `flashcards.deck_id` (linia 88) - szybkie filtrowanie po talii
   - Index na `decks.user_id` (linia 86) - szybkie sprawdzenie właściciela

3. **Funkcja PostgreSQL**:
   - `update_srs_data_on_review` wykonuje całą logikę SM-2 w bazie danych
   - Unika round-tripów między aplikacją a bazą
   - Transakcyjna aktualizacja zapewnia spójność danych

### Potencjalne wąskie gardła i rozwiązania

1. **Duża liczba fiszek do powtórki**:
   - **Problem**: Użytkownik może mieć setki zaległych fiszek
   - **Rozwiązanie**: Ograniczyć liczbę zwracanych fiszek (np. max 50 per sesja)
   - **Implementacja**:
     ```typescript
     .limit(50) // W zapytaniu Supabase
     ```

2. **Równoczesne aktualizacje tej samej fiszki**:
   - **Problem**: Użytkownik może wysłać wiele żądań POST /api/reviews dla tej samej fiszki
   - **Rozwiązanie**: Funkcja PostgreSQL używa transakcji, więc aktualizacje są atomowe
   - **Dodatkowa ochrona**: Rozważyć idempotency key lub rate limiting

3. **Cache'owanie**:
   - **GET /api/decks/{deckId}/review**: Nie cache'ować - dane muszą być aktualne (due_date zmienia się codziennie)
   - **POST /api/reviews**: Nie cache'ować - to operacja zmieniająca stan

### Monitoring i metryki

- Logować czas wykonania zapytań bazodanowych
- Monitorować liczbę fiszek zwracanych per request
- Śledzić błędy 500 - mogą wskazywać problemy z funkcją PostgreSQL

---

## 9. Etapy wdrożenia

### Krok 1: Utworzenie schematów walidacji Zod

**Plik**: `src/lib/schemas/review-schemas.ts`

```typescript
import { z } from 'zod';

export const getDeckReviewParamsSchema = z.object({
  deckId: z.string().uuid({ message: 'Invalid deck ID format' }),
});

export const submitReviewSchema = z.object({
  flashcard_id: z.string().uuid({ message: 'Invalid flashcard ID format' }),
  quality: z.enum(['again', 'good', 'easy'], {
    errorMap: () => ({ message: "Quality must be one of 'again', 'good', 'easy'" }),
  }),
});
```

### Krok 2: Utworzenie serwisu review-service.ts

**Plik**: `src/lib/services/review-service.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReviewFlashcardDTO, ReviewResponseDTO, ReviewQualityEnum } from '../../types';

export async function getFlashcardsForReview(
  supabase: SupabaseClient,
  userId: string,
  deckId: string
): Promise<ReviewFlashcardDTO[]> {
  // Zapytanie do widoku flashcards_with_srs
  const { data, error } = await supabase
    .from('flashcards_with_srs')
    .select('id, front, back')
    .eq('deck_id', deckId)
    .eq('user_id', userId)
    .lte('due_date', new Date().toISOString().split('T')[0]) // due_date <= CURRENT_DATE
    .limit(50); // Limit dla wydajności

  if (error) {
    console.error('Error fetching flashcards for review:', error);
    throw new Error('Failed to fetch flashcards');
  }

  // Jeśli brak wyników, sprawdzić czy talia istnieje
  if (!data || data.length === 0) {
    const { data: deckData, error: deckError } = await supabase
      .from('decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', userId)
      .single();

    if (deckError || !deckData) {
      throw new Error('Deck not found');
    }
  }

  return data || [];
}

export async function submitReview(
  supabase: SupabaseClient,
  userId: string,
  flashcardId: string,
  quality: ReviewQualityEnum
): Promise<ReviewResponseDTO> {
  // 1. Sprawdzić ownership fiszki
  const { data: flashcardData, error: flashcardError } = await supabase
    .from('flashcards_with_srs')
    .select('id, user_id')
    .eq('id', flashcardId)
    .single();

  if (flashcardError || !flashcardData) {
    throw new Error('Flashcard not found');
  }

  if (flashcardData.user_id !== userId) {
    throw new Error('Flashcard not found'); // Nie ujawniać, że istnieje
  }

  // 2. Wywołać funkcję PostgreSQL
  const { error: updateError } = await supabase.rpc('update_srs_data_on_review', {
    p_flashcard_id: flashcardId,
    p_quality: quality,
  });

  if (updateError) {
    console.error('Error calling update_srs_data_on_review:', updateError);
    throw new Error('Failed to update review data');
  }

  // 3. Pobrać zaktualizowane dane SRS
  const { data: srsData, error: srsError } = await supabase
    .from('flashcard_srs_data')
    .select('due_date, interval')
    .eq('flashcard_id', flashcardId)
    .single();

  if (srsError || !srsData) {
    console.error('Error fetching updated SRS data:', srsError);
    throw new Error('Failed to fetch updated SRS data');
  }

  return {
    flashcard_id: flashcardId,
    next_due_date: srsData.due_date,
    new_interval: srsData.interval,
  };
}
```

### Krok 3: Implementacja endpointu GET /api/decks/[deckId]/review

**Plik**: `src/pages/api/decks/[deckId]/review.ts`

```typescript
import type { APIContext } from 'astro';
import { getDeckReviewParamsSchema } from '../../../lib/schemas/review-schemas';
import { getFlashcardsForReview } from '../../../lib/services/review-service';
import type { ReviewFlashcardsDTO } from '../../../types';
import { z } from 'zod';

export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  const supabase = context.locals.supabase;
  const userId = context.locals.userId;

  // Check authentication
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // Validate deckId parameter
    const deckId = context.params.deckId;
    const validated = getDeckReviewParamsSchema.parse({ deckId });

    // Fetch flashcards for review
    const flashcards = await getFlashcardsForReview(supabase, userId, validated.deckId);

    const response: ReviewFlashcardsDTO = { flashcards };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid deck ID format', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof Error && error.message === 'Deck not found') {
      return new Response(
        JSON.stringify({ error: 'Deck not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('Unexpected error in GET /api/decks/[deckId]/review:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### Krok 4: Implementacja endpointu POST /api/reviews

**Plik**: `src/pages/api/reviews.ts`

```typescript
import type { APIContext } from 'astro';
import { submitReviewSchema } from '../../lib/schemas/review-schemas';
import { submitReview } from '../../lib/services/review-service';
import type { SubmitReviewCommand, ReviewResponseDTO } from '../../types';
import { z } from 'zod';

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  const supabase = context.locals.supabase;
  const userId = context.locals.userId;

  // Check authentication
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // Parse and validate request body
    const body = await context.request.json();
    const validated: SubmitReviewCommand = submitReviewSchema.parse(body);

    // Submit review
    const result = await submitReview(
      supabase,
      userId,
      validated.flashcard_id,
      validated.quality
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof Error && error.message === 'Flashcard not found') {
      return new Response(
        JSON.stringify({ error: 'Flashcard not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof Error && error.message.includes('Failed to update')) {
      console.error('Database error in POST /api/reviews:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update review data' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('Unexpected error in POST /api/reviews:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### Krok 5: Testowanie

**Testy manualne**:

1. **GET /api/decks/{deckId}/review**:
   - Test z prawidłowym `deckId` i tokenem → 200 OK
   - Test z nieprawidłowym `deckId` (nie UUID) → 400 Bad Request
   - Test bez tokenu → 401 Unauthorized
   - Test z `deckId` nienależącym do użytkownika → 404 Not Found
   - Test z talią bez fiszek do powtórki → 200 OK z pustą tablicą

2. **POST /api/reviews**:
   - Test z prawidłowymi danymi (`flashcard_id`, `quality: "good"`) → 200 OK
   - Test z nieprawidłowym `quality` (np. "invalid") → 400 Bad Request
   - Test bez tokenu → 401 Unauthorized
   - Test z `flashcard_id` nienależącym do użytkownika → 404 Not Found
   - Test z każdą wartością `quality` ("again", "good", "easy") → weryfikacja różnych intervalów

**Testy automatyczne** (opcjonalnie):
- Użyć narzędzi takich jak Vitest lub Playwright do E2E testów
- Mocki Supabase dla testów jednostkowych service layer

### Krok 6: Dokumentacja i weryfikacja

- Zaktualizować dokumentację API (jeśli istnieje)
- Sprawdzić, czy typy w `src/types.ts` są zgodne z implementacją
- Zweryfikować, czy funkcja PostgreSQL `update_srs_data_on_review` działa poprawnie
- Przetestować wydajność z dużą liczbą fiszek (≥50)

---

## 10. Dodatkowe uwagi

### Rozszerzenia funkcjonalności (przyszłość)

1. **Paginacja dla GET /api/decks/{deckId}/review**:
   - Dodać parametry `page` i `limit`
   - Zwracać `PaginationDTO` w odpowiedzi

2. **Filtrowanie fiszek**:
   - Możliwość filtrowania po `creation_source` (manual vs ai_generated)
   - Sortowanie po `due_date` (od najstarszych)

3. **Statystyki sesji**:
   - Dodać endpoint GET /api/decks/{deckId}/review/stats
   - Zwracać liczby fiszek: due today, due this week, total reviewed

4. **Bulk review submission**:
   - Endpoint POST /api/reviews/bulk
   - Pozwala na przesłanie ocen wielu fiszek jednocześnie

### Integracja z frontendem

**Przykładowe użycie w React Query**:

```typescript
// Hook dla GET /api/decks/{deckId}/review
const useFlashcardsForReview = (deckId: string) => {
  return useQuery({
    queryKey: ['flashcards', 'review', deckId],
    queryFn: async () => {
      const response = await fetch(`/api/decks/${deckId}/review`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch flashcards');
      return response.json() as Promise<ReviewFlashcardsDTO>;
    },
  });
};

// Hook dla POST /api/reviews
const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (command: SubmitReviewCommand) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(command),
      });
      if (!response.ok) throw new Error('Failed to submit review');
      return response.json() as Promise<ReviewResponseDTO>;
    },
    onSuccess: (data, variables) => {
      // Invalidate flashcards query to refetch
      queryClient.invalidateQueries(['flashcards', 'review']);
    },
  });
};
```

### Zgodność z db-plan.md

- Wykorzystuje widok `flashcards_with_srs` (linie 170-192)
- Wywołuje funkcję `update_srs_data_on_review` (linie 116-166)
- Respektuje ograniczenia długości (`front` ≤ 200 chars, `back` ≤ 500 chars)
- Używa typu enum `review_quality_enum` (linia 72)

---

**Koniec planu implementacji**
