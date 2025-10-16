# Architektura UI dla 10xdevsFishcards

## 1. Przegląd struktury UI

Aplikacja 10xdevsFishcards to aplikacja webowa do tworzenia i nauki fiszek edukacyjnych z wykorzystaniem sztucznej inteligencji. Architektura UI została zaprojektowana w oparciu o następujące założenia technologiczne:

- **Framework**: Astro 5 z React 19 dla komponentów interaktywnych
- **Stylizacja**: Tailwind CSS 4
- **Biblioteka komponentów**: Shadcn/ui (zgodna z Google Material Design)
- **Zarządzanie stanem**: React Query lub SWR dla stanu API, sessionStorage dla sesji nauki
- **Walidacja formularzy**: React Hook Form z integracją Zod
- **Responsywność**: Mobile-first approach z breakpointami Tailwind
- **Dostępność**: Zgodność z WCAG 2.1 (semantyczny HTML, ARIA, keyboard navigation)

Aplikacja składa się z 9 głównych widoków połączonych logicznymi przepływami użytkownika, zapewniających intuicyjną nawigację i spójne doświadczenie na różnych urządzeniach.

## 2. Lista widoków

### 2.1. Strona logowania

**Ścieżka widoku**: `/login`

**Główny cel**: Umożliwienie użytkownikowi zalogowania się do aplikacji za pomocą Supabase Auth.

**Kluczowe informacje do wyświetlenia**:
- Formularz logowania (email, hasło)
- Link do strony rejestracji
- Komunikaty o błędach autoryzacji

**Kluczowe komponenty widoku**:
- **Logo aplikacji** (opcjonalne, w nagłówku)
- **Nagłówek**: "Zaloguj się do 10xdevsFishcards"
- **Formularz logowania** (react-hook-form + Zod):
  - Pole email (type="email", required, walidacja formatu email)
  - Pole hasło (type="password", required)
  - Toggle "Pokaż hasło" (ikona oka)
  - Komunikaty o błędach walidacji (inline, pod polami, kolor czerwony)
  - Przycisk "Zaloguj się" (disabled podczas ładowania, pokazuje spinner)
- **Link do rejestracji**: "Nie masz konta? Zarejestruj się" → `/register`
- **Toast notification** dla błędów API (np. "Nieprawidłowy email lub hasło", "Błąd połączenia")

**UX, dostępność i względy bezpieczeństwa**:
- Walidacja onBlur i onChange dla lepszej responsywności
- Focus trap w formularzu (focus automatycznie na pierwszym polu)
- Aria labels dla wszystkich pól ("Email", "Hasło")
- Hasło domyślnie ukryte (type="password") z opcją pokazania
- Zabezpieczenie przed CSRF (tokeny Supabase)
- HTTPS dla całej aplikacji
- Komunikaty o błędach nie ujawniają szczegółów (np. "Nieprawidłowy email lub hasło" zamiast "Email nie istnieje")
- Po pomyślnym logowaniu przekierowanie do `/dashboard`
- Jeśli użytkownik jest już zalogowany, automatyczne przekierowanie do `/dashboard`

---

### 2.2. Strona rejestracji

**Ścieżka widoku**: `/register`

**Główny cel**: Umożliwienie nowemu użytkownikowi utworzenia konta w aplikacji.

**Kluczowe informacje do wyświetlenia**:
- Formularz rejestracji (email, hasło, potwierdzenie hasła)
- Link do strony logowania
- Komunikaty o błędach walidacji i API

**Kluczowe komponenty widoku**:
- **Logo aplikacji** (opcjonalne, w nagłówku)
- **Nagłówek**: "Zarejestruj się w 10xdevsFishcards"
- **Formularz rejestracji** (react-hook-form + Zod):
  - Pole email (type="email", required, walidacja formatu email)
  - Pole hasło (type="password", required, min. 8 znaków, wymogi bezpieczeństwa)
  - Pole potwierdzenia hasła (type="password", required, musi być identyczne z hasłem)
  - Wskaźnik siły hasła (opcjonalnie: pasek z kolorami)
  - Toggle "Pokaż hasło" dla obu pól hasła
  - Komunikaty o błędach walidacji (inline, pod polami)
  - Przycisk "Zarejestruj się" (disabled podczas ładowania, pokazuje spinner)
- **Link do logowania**: "Masz już konto? Zaloguj się" → `/login`
- **Toast notification** dla błędów API (np. "Email już istnieje", "Błąd serwera")

**UX, dostępność i względy bezpieczeństwa**:
- Walidacja onBlur i onChange
- Walidacja synchroniczna hasła i potwierdzenia hasła
- Wskaźnik siły hasła (opcjonalnie: weak/medium/strong)
- Focus trap w formularzu
- Aria labels dla wszystkich pól
- Wymogi hasła: min. 8 znaków, zalecane: cyfra, wielka litera, znak specjalny
- Po pomyślnej rejestracji: przekierowanie do `/login` lub automatyczne zalogowanie → `/dashboard`
- Opcjonalne: weryfikacja email (jeśli wymagana przez Supabase)

---

### 2.3. Dashboard / Strona główna

**Ścieżka widoku**: `/` lub `/dashboard`

**Główny cel**: Główny punkt wejścia do aplikacji, umożliwiający generowanie fiszek przez AI.

**Kluczowe informacje do wyświetlenia**:
- Formularz generowania fiszek z polem tekstowym
- Licznik znaków i walidacja (2000-10 000 znaków)
- Lista wygenerowanych propozycji fiszek (po generowaniu)
- Stany: początkowy, ładowanie, błąd, sukces

**Kluczowe komponenty widoku**:
- **Nagłówek**: "Generuj fiszki z AI"
- **Sekcja generowania AI**:
  - **Textarea** dla tekstu źródłowego:
    - Placeholder: "Wklej tekst (2000-10 000 znaków)..."
    - Automatyczne skalowanie wysokości (autoResize) lub fixed rows=10
    - Monospace font (opcjonalnie, dla lepszej czytelności kodu)
  - **Licznik znaków**: "X / 10 000"
    - Kolor: szary (poniżej 2000), zielony (2000-10 000), czerwony (powyżej 10 000)
  - **Komunikat walidacji** (inline, pod textarea, jeśli błąd):
    - "Tekst musi zawierać od 2000 do 10 000 znaków"
  - **Przycisk "Generuj fiszki"**:
    - Disabled jeśli walidacja niepoprawna lub podczas ładowania
    - Pokazuje spinner podczas generowania
- **Sekcja stanów**:
  - **Stan początkowy**: Tylko formularz generowania
  - **Stan ładowania**: Skeleton loader dla listy propozycji (3-5 placeholder cards)
  - **Stan błędu**:
    - Ikona błędu (alert circle)
    - Komunikat: mapowanie błędów API na przyjazne komunikaty
      - 400: "Tekst zawiera nieprawidłowe znaki lub jest za krótki/długi"
      - 503: "Usługa AI jest chwilowo niedostępna. Spróbuj ponownie za chwilę."
      - Network error: "Utracono połączenie z siecią. Sprawdź swoje połączenie."
      - Timeout: "Generowanie trwa zbyt długo. Spróbuj ponownie."
    - Przycisk "Spróbuj ponownie" (wywołuje ponowne generowanie)
  - **Stan sukcesu**: Lista propozycji fiszek (poniżej)

**Lista propozycji fiszek** (po generowaniu):
- **Nagłówek sekcji**:
  - "Propozycje fiszek (X)" (gdzie X = liczba wygenerowanych propozycji)
  - Przycisk "Zapisz jako talię" (sticky na górze lub na dole listy)
    - Disabled jeśli żadna fiszka nie jest zaznaczona
    - Tooltip: "Zaznacz co najmniej jedną fiszkę"
- **Przewijana lista propozycji**:
  - Max-height: 600px, overflow-y: auto
  - Każda propozycja to karta (card) z:
    - **Checkbox** (domyślnie zaznaczony):
      - Label: "Akceptuj" (aria-label: "Akceptuj fiszkę X")
    - **Pole przód** (textarea, edytowalne inline):
      - Max 200 znaków
      - Licznik znaków: "X / 200" (zmienia kolor na czerwony po przekroczeniu)
      - Komunikat błędu walidacji (jeśli > 200): "Maksymalnie 200 znaków"
    - **Pole tył** (textarea, edytowalne inline):
      - Max 500 znaków
      - Licznik znaków: "X / 500" (zmienia kolor na czerwony po przekroczeniu)
      - Komunikat błędu walidacji (jeśli > 500): "Maksymalnie 500 znaków"
    - **Przycisk "Usuń"** (ikona kosza):
      - Odznacza checkbox lub usuwa z listy (do decyzji implementacyjnej)
  - Nawigacja strzałkami (opcjonalnie, jeśli lista > 10 elementów):
    - Przyciski: "Poprzednia" / "Następna"
    - Keyboard navigation: Arrow Up/Down
- **Przycisk "Zapisz jako talię"** (na dole):
  - Wywołuje `POST /api/ai/save`
  - Automatyczna nazwa talii: YYYY-MM-DD_HH-MM
  - Po sukcesie: Toast "Talia zapisana!" + przekierowanie do `/decks/{deckId}`
  - Po błędzie: Toast z komunikatem błędu

**UX, dostępność i względy bezpieczeństwa**:
- Walidacja textarea: onBlur i onChange, debounce dla licznika znaków
- Oczyszczanie tekstu ze zbędnych znaków (trim, normalizacja spacji) przed wysłaniem do API
- Sanity check tekstu pod kątem bezpieczeństwa (XSS prevention, sanitization)
- Aria-live dla komunikatów o statusie generowania ("Generowanie fiszek...", "Fiszki wygenerowane")
- Keyboard navigation dla listy propozycji (Tab, Arrow keys)
- Focus management: po wygenerowaniu fiszek focus na pierwszej propozycji
- Loading state podczas zapisu: przycisk "Zapisz jako talię" pokazuje spinner i tekst "Zapisywanie..."
- Scroll do góry listy po wygenerowaniu

---

### 2.4. Ręczne tworzenie talii

**Ścieżka widoku**: `/decks/new`

**Główny cel**: Umożliwienie użytkownikowi manualnego tworzenia talii z fiszkami.

**Kluczowe informacje do wyświetlenia**:
- Formularz tworzenia talii (nazwa talii)
- Formularz dodawania fiszek (przód, tył)
- Lista dodanych fiszek z opcjami edycji i usunięcia

**Kluczowe komponenty widoku**:
- **Nagłówek**: "Utwórz nową talię"
- **Formularz nazwy talii** (react-hook-form + Zod):
  - **Pole nazwa talii** (input text):
    - Label: "Nazwa talii"
    - Placeholder: "Np. Angielski - Czasowniki nieregularne"
    - Required
    - Komunikat błędu walidacji (jeśli puste): "Nazwa talii jest wymagana"
- **Sekcja dodawania fiszek**:
  - **Formularz dodawania fiszki**:
    - **Pole przód** (textarea):
      - Label: "Przód fiszki"
      - Placeholder: "Np. What is the capital of France?"
      - Max 200 znaków
      - Licznik znaków: "X / 200"
      - Required
    - **Pole tył** (textarea):
      - Label: "Tył fiszki"
      - Placeholder: "Np. Paris"
      - Max 500 znaków
      - Licznik znaków: "X / 500"
      - Required
    - **Przycisk "Dodaj fiszkę"**:
      - Disabled jeśli pola są puste lub przekroczono limity
      - Po kliknięciu: dodaje fiszkę do listy, czyści pola formularza
      - Keyboard shortcut: Ctrl+Enter (opcjonalnie)
  - **Lista dodanych fiszek**:
    - Wyświetlana poniżej formularza dodawania
    - Każda fiszka to karta (card) z:
      - Numer fiszki (np. "Fiszka 1")
      - Przód fiszki (tekst)
      - Tył fiszki (tekst)
      - Przyciski akcji:
        - "Edytuj" (ikona ołówka): włącza edycję inline
        - "Usuń" (ikona kosza): usuwa fiszkę z listy (z potwierdzeniem opcjonalnie)
    - **Edycja inline**:
      - Po kliknięciu "Edytuj": pola zamieniają się w textarea
      - Liczniki znaków (200/500)
      - Przyciski: "Zapisz", "Anuluj"
      - Walidacja w czasie rzeczywistym
    - **Stan pusty** (jeśli brak fiszek):
      - Komunikat: "Nie dodano jeszcze żadnych fiszek. Wypełnij formularz powyżej i kliknij 'Dodaj fiszkę'."
- **Przyciski akcji** (na dole strony):
  - **Przycisk "Zapisz talię"**:
    - Disabled jeśli: brak nazwy talii, brak fiszek, błędy walidacji
    - Wywołuje `POST /api/decks`
    - Po sukcesie: Toast "Talia utworzona!" + przekierowanie do `/decks/{deckId}` lub `/decks`
    - Po błędzie: Toast z komunikatem błędu
  - **Przycisk "Anuluj"**:
    - Powrót do `/decks` lub `/dashboard`
    - Jeśli są niezapisane zmiany: wyświetla modal potwierdzenia "Czy na pewno chcesz opuścić? Niezapisane zmiany zostaną utracone."

**UX, dostępność i względy bezpieczeństwa**:
- Walidacja onBlur i onChange dla wszystkich pól
- Liczniki znaków zmieniające kolor po przekroczeniu limitu
- Blokada zapisu po przekroczeniu limitu
- Focus management: po dodaniu fiszki focus wraca do pola "Przód"
- Keyboard navigation: Tab przez pola, Ctrl+Enter do dodania fiszki
- Aria-live dla komunikatów o dodaniu/usunięciu fiszki
- Potwierdzenie przed opuszczeniem strony z niezapisanymi zmianami (window.onbeforeunload)
- Przycisk "Zapisz talię" pokazuje spinner podczas zapisu

---

### 2.5. Lista talii

**Ścieżka widoku**: `/decks`

**Główny cel**: Wyświetlenie wszystkich talii użytkownika z możliwością sortowania, przeglądania i zarządzania.

**Kluczowe informacje do wyświetlenia**:
- Responsywna siatka kart talii
- Dla każdej karty: nazwa, data utworzenia, liczba fiszek, przyciski akcji
- Opcje sortowania i paginacja (opcjonalnie)

**Kluczowe komponenty widoku**:
- **Nagłówek**: "Moje talie"
- **Toolbar** (na górze):
  - **Przycisk "Utwórz nową talię"** (ikona plus):
    - Prowadzi do `/decks/new`
    - Prominent, primary button
  - **Opcje sortowania** (opcjonalnie, dropdown):
    - "Najnowsze" (domyślne, sortowanie po `created_at desc`)
    - "Najstarsze" (sortowanie po `created_at asc`)
    - "Nazwa A-Z" (sortowanie po `name asc`)
    - "Nazwa Z-A" (sortowanie po `name desc`)
- **Responsywna siatka kart talii**:
  - **Layout**:
    - Mobile (< 768px): 1 kolumna
    - Tablet (768px - 1024px): 2 kolumny
    - Desktop (> 1024px): 3-4 kolumny (Grid auto-fit, minmax(280px, 1fr))
  - **Karta talii** (dla każdej talii):
    - **Nazwa talii** (nagłówek karty, link do `/decks/{deckId}`):
      - Font: semi-bold, rozmiar większy niż body
      - Truncate jeśli za długa (max 2 linie, ellipsis)
    - **Data utworzenia**:
      - Format: "DD.MM.YYYY" lub względny ("2 dni temu", "Wczoraj", "Dzisiaj")
      - Kolor: secondary text color (szary)
    - **Liczba fiszek**:
      - Format: "X fiszek" (lub "1 fiszka" dla singular)
      - Ikona karty obok tekstu
    - **Przyciski akcji** (na dole karty, row layout):
      - **"Ucz się"** (primary button):
        - Prowadzi do `/decks/{deckId}/study`
        - Ikona: ikona książki lub brain
      - **"Edytuj"** (secondary button):
        - Prowadzi do `/decks/{deckId}`
        - Ikona: ołówek
      - **"Usuń"** (danger button, outline):
        - Wyświetla modal potwierdzenia
        - Ikona: kosz
- **Stan ładowania**:
  - Skeleton loader dla siatki (3-4 placeholder cards)
- **Stan pusty** (jeśli brak talii):
  - Ilustracja lub ikona (empty state)
  - Nagłówek: "Nie masz jeszcze żadnych talii"
  - Tekst: "Zacznij od wygenerowania fiszek przez AI lub utwórz talię ręcznie"
  - Przyciski:
    - "Generuj fiszki z AI" → `/dashboard`
    - "Utwórz talię ręcznie" → `/decks/new`
- **Paginacja** (opcjonalnie, jeśli dużo talii):
  - Numery stron lub "Load More" button
  - API: `GET /api/decks?page=1&limit=12`

**Modal potwierdzenia usunięcia**:
- **Nagłówek**: "Usuń talię"
- **Treść**: "Czy na pewno chcesz usunąć talię '[Nazwa talii]'? Zostaną usunięte wszystkie fiszki z tej talii. Tej operacji nie można cofnąć."
- **Przyciski**:
  - "Anuluj" (secondary)
  - "Usuń" (danger, primary)
- Po kliknięciu "Usuń":
  - Wywołuje `DELETE /api/decks/{deckId}`
  - Toast: "Talia usunięta"
  - Odświeża listę talii (React Query invalidate)

**UX, dostępność i względy bezpieczeństwa**:
- Karty talii jako linki (semantic: card wrapping `<a>` tag lub card body as link)
- Hover effects na kartach (shadow, lift, border color)
- Keyboard navigation: Tab przez karty, Enter na przyciski
- Aria labels dla przycisków akcji ("Ucz się talia [Nazwa]", "Edytuj talię [Nazwa]", "Usuń talię [Nazwa]")
- Loading state podczas usuwania: przycisk "Usuń" pokazuje spinner
- Optimistic updates dla usuwania (React Query)
- Focus management: po zamknięciu modala focus wraca do karty

---

### 2.6. Szczegóły talii

**Ścieżka widoku**: `/decks/{deckId}`

**Główny cel**: Wyświetlenie szczegółowych informacji o talii i zarządzanie fiszkami.

**Kluczowe informacje do wyświetlenia**:
- Nagłówek talii (nazwa, data utworzenia, liczba fiszek)
- Lista fiszek z opcjami edycji inline i usuwania
- Opcje zarządzania talią (edycja nazwy, usunięcie, rozpoczęcie nauki)

**Kluczowe komponenty widoku**:
- **Nagłówek talii** (hero section):
  - **Nazwa talii** (edytowalna):
    - Kliknięcie pokazuje inline editing lub modal
    - Ikona ołówka obok nazwy (hover)
  - **Metadane talii**:
    - Data utworzenia: "Utworzona: DD.MM.YYYY"
    - Ostatnia powtórka: "Ostatnia nauka: DD.MM.YYYY" (opcjonalnie)
    - Liczba fiszek: "X fiszek"
  - **Przyciski akcji** (row layout):
    - **"Rozpocznij naukę"** (primary, large button):
      - Prowadzi do `/decks/{deckId}/study`
      - Ikona: play lub brain
    - **"Dodaj fiszkę"** (secondary button):
      - Otwiera formularz inline (poniżej) lub modal
      - Ikona: plus
    - **"Usuń talię"** (danger button, outline):
      - Wyświetla modal potwierdzenia
      - Ikona: kosz

**Edycja nazwy talii**:
- **Opcja 1: Inline editing**:
  - Kliknięcie na nazwę talii zamienia ją w input field
  - Przyciski: "Zapisz", "Anuluj"
  - Po zapisaniu: wywołuje `PATCH /api/decks/{deckId}`, Toast "Nazwa talii zaktualizowana"
- **Opcja 2: Modal**:
  - Modal z formularzem (input text)
  - Walidacja: nazwa wymagana
  - Przyciski: "Zapisz", "Anuluj"

**Formularz dodawania fiszki** (inline, poniżej nagłówka lub na dole):
- **Pola**:
  - Przód (textarea, max 200 znaków, licznik znaków)
  - Tył (textarea, max 500 znaków, licznik znaków)
- **Przyciski**: "Dodaj", "Anuluj"
- Po dodaniu: wywołuje `POST /api/decks/{deckId}/flashcards`, Toast "Fiszka dodana", odświeża listę

**Lista fiszek**:
- **Layout**: Tabela lub lista kart
- **Kolumny** (jeśli tabela):
  - #: Numer fiszki (1, 2, 3...)
  - Przód: Treść przodu fiszki
  - Tył: Treść tyłu fiszki
  - Akcje: Przyciski "Edytuj", "Usuń"
- **Karta fiszki** (jeśli lista kart):
  - Numer fiszki (np. "Fiszka 1")
  - Przód fiszki (tekst, max 2-3 linie, ellipsis)
  - Tył fiszki (tekst, max 2-3 linie, ellipsis)
  - Przyciski akcji:
    - "Edytuj" (ikona ołówka): włącza edycję inline
    - "Usuń" (ikona kosza): usuwa fiszkę (z potwierdzeniem opcjonalnie)

**Edycja fiszki inline**:
- Po kliknięciu "Edytuj": pola zamieniają się w textarea
- Liczniki znaków (200/500)
- Przyciski: "Zapisz", "Anuluj"
- Po zapisaniu: wywołuje `PATCH /api/flashcards/{flashcardId}`, Toast "Fiszka zaktualizowana"

**Stan pusty** (jeśli brak fiszek):
- Ilustracja lub ikona
- Tekst: "Ta talia nie ma jeszcze fiszek"
- Przycisk "Dodaj pierwszą fiszkę" (otwiera formularz dodawania)

**Stan ładowania**:
- Skeleton loader dla nagłówka i listy fiszek

**Stan błędu** (jeśli talia nie istnieje, 404):
- Strona 404 lub przekierowanie do `/decks` z toastem: "Talia nie została znaleziona"

**UX, dostępność i względy bezpieczeństwa**:
- Edycja nazwy talii: inline lub modal, z walidacją
- Edycja fiszek: inline editing z autosave (opcjonalnie) lub przyciskiem "Zapisz"
- Potwierdzenie usunięcia fiszki (opcjonalnie, jeśli chcemy uniknąć przypadkowego usunięcia):
  - Modal: "Czy na pewno chcesz usunąć tę fiszkę?"
  - Lub: usuwanie bez potwierdzenia z możliwością "Undo" (Toast z przyciskiem "Cofnij")
- Potwierdzenie usunięcia talii (modal): "Czy na pewno chcesz usunąć tę talię? Zostaną usunięte wszystkie fiszki. Tej operacji nie można cofnąć."
- Aria-live dla komunikatów o statusie zapisywania/usuwania
- Loading states podczas operacji API (spinnery na przyciskach)
- Keyboard navigation: Tab przez fiszki, Enter na przyciski
- Focus management: po dodaniu fiszki focus wraca do formularza, po edycji focus wraca do przycisku "Edytuj"

---

### 2.7. Sesja nauki

**Ścieżka widoku**: `/decks/{deckId}/study`

**Główny cel**: Przeprowadzenie sesji nauki z fiszkami z wykorzystaniem algorytmu SM-2.

**Kluczowe informacje do wyświetlenia**:
- Widok pojedynczej fiszki (przód, tył)
- Postęp sesji (X z Y)
- Przyciski oceny ("Nie wiem", "Wiem", "Bardzo łatwe")

**Kluczowe komponenty widoku**:
- **Nagłówek sesji**:
  - **Nazwa talii** (tekst, secondary color)
  - **Postęp sesji**: "Fiszka X z Y"
    - Progress bar (opcjonalnie)
  - **Przycisk "Zakończ sesję"** (secondary, outline):
    - Wyświetla modal potwierdzenia (jeśli sesja w trakcie): "Czy na pewno chcesz zakończyć sesję? Postęp zostanie utracony." (lub zapisany w sessionStorage)
    - Po potwierdzeniu: powrót do `/decks/{deckId}` lub `/decks`

**Widok fiszki**:
- **Stan początkowy (przód fiszki)**:
  - **Karta fiszki** (centered, large size):
    - Tekst przodu fiszki (font: large, centered, padding: generous)
    - Kolor tła: neutralny (biały lub light gray)
  - **Przycisk "Pokaż odpowiedź"** (centered, poniżej karty):
    - Large, primary button
    - Keyboard shortcut: Space lub Enter
- **Stan po odsłonięciu (tył fiszki)**:
  - **Karta fiszki** (divided):
    - **Górna część**: Przód fiszki (mniejszy rozmiar tekstu, secondary color)
    - **Separator** (linia horyzontalna)
    - **Dolna część**: Tył fiszki (większy rozmiar tekstu, primary color)
  - **Przyciski oceny** (centered, poniżej karty, row layout):
    - **"Nie wiem"** (color: red, opcjonalnie ikona X):
      - Mapuje na quality: "again" w API (`POST /api/reviews`)
      - Keyboard shortcut: 1 lub Numpad 1
    - **"Wiem"** (color: yellow/orange, opcjonalnie ikona check):
      - Mapuje na quality: "good" w API
      - Keyboard shortcut: 2 lub Numpad 2
    - **"Bardzo łatwe"** (color: green, opcjonalnie ikona double check):
      - Mapuje na quality: "easy" w API
      - Keyboard shortcut: 3 lub Numpad 3

**Przejście do kolejnej fiszki**:
- Po kliknięciu przycisku oceny:
  - Wywołuje `POST /api/reviews` z `flashcard_id` i `quality`
  - Animacja przejścia (opcjonalnie: fade out/in, slide)
  - Wyświetla następną fiszkę (przód)
- Aktualizacja postępu: "Fiszka X+1 z Y"

**Stan ładowania**:
- **Początkowy**: Spinner lub skeleton podczas pobierania fiszek (`GET /api/decks/{deckId}/review`)
- **Podczas zapisu oceny**: Loading state na przycisku (opcjonalnie, jeśli API wolne)

**Stan błędu**:
- **Błąd pobierania fiszek**:
  - Komunikat: "Nie udało się pobrać fiszek. Spróbuj ponownie."
  - Przycisk "Spróbuj ponownie" (wywołuje ponownie `GET /api/decks/{deckId}/review`)
- **Błąd zapisu oceny**:
  - Toast: "Nie udało się zapisać oceny. Spróbuj ponownie."
  - Możliwość ponowienia oceny dla tej samej fiszki (pozostaje na tej fiszce)

**Stan: Brak fiszek do nauki**:
- Ilustracja lub ikona (celebration)
- Nagłówek: "Świetna robota!"
- Tekst: "Nie masz fiszek do powtórki. Wróć później lub przeglądaj inne talie."
- Przycisk "Wróć do listy talii" → `/decks`

**Zakończenie sesji** (po ostatniej fiszce):
- Wywołuje modal podsumowania sesji (poniżej)

**UX, dostępność i względy bezpieczeństwa**:
- Keyboard navigation: Space/Enter dla "Pokaż odpowiedź", 1/2/3 dla ocen
- Animacje przejścia między fiszkami (opcjonalnie, subtle, bez motion sickness)
- Zapisywanie stanu sesji w sessionStorage (fiszki do powtórki, indeks bieżącej fiszki), aby przetrwać odświeżenie strony
- Progress bar lub indicator (wizualizacja postępu)
- Aria-live dla ogłaszania postępu ("Fiszka 5 z 20", "Odpowiedź odsłonięta")
- Focus management: po odsłonięciu odpowiedzi focus na pierwszy przycisk oceny
- Responsywność: karta fiszki dostosowuje się do rozmiaru ekranu (mobile: mniejszy rozmiar tekstu)

---

### 2.8. Podsumowanie sesji nauki

**Ścieżka widoku**: Modal (overlay) na `/decks/{deckId}/study`

**Główny cel**: Wyświetlenie podsumowania zakończonej sesji nauki.

**Kluczowe informacje do wyświetlenia**:
- Liczba przejrzanych fiszek
- Procent poprawnych odpowiedzi (opcjonalnie: definicja "poprawne" = "Wiem" + "Bardzo łatwe")
- Rozkład ocen (opcjonalnie)

**Kluczowe komponenty widoku**:
- **Modal** (centered, overlay z dark backdrop):
  - **Nagłówek**: "Podsumowanie sesji"
    - Ikona: celebration (party popper) lub checkmark
  - **Treść**:
    - **Liczba przejrzanych fiszek**: "Przejrzane fiszki: X"
    - **Procent poprawnych odpowiedzi**: "Poprawne odpowiedzi: Y%"
      - Definicja "poprawne": "Wiem" (good) + "Bardzo łatwe" (easy)
      - Licznik: (good_count + easy_count) / total_count * 100
    - **Rozkład ocen** (opcjonalnie):
      - "Nie wiem: A"
      - "Wiem: B"
      - "Bardzo łatwe: C"
  - **Przyciski akcji** (row layout):
    - **"Zamknij"** (secondary button):
      - Powrót do `/decks/{deckId}` lub `/decks`
    - **"Rozpocznij ponownie"** (primary button, opcjonalnie):
      - Rozpoczyna nową sesję nauki dla tej samej talii
      - Przekierowanie do `/decks/{deckId}/study`

**UX, dostępność i względy bezpieczeństwa**:
- Modal z focus trap (focus na pierwszym przycisku)
- Zamknięcie przez ESC (keyboard shortcut)
- Zamknięcie przez kliknięcie poza modal (backdrop click)
- Aria role="dialog", aria-labelledby dla nagłówka
- Animacja otwarcia/zamknięcia modala (fade in/out)
- Po zamknięciu: focus wraca do elementu, który wywołał modal (lub do przycisu "Rozpocznij naukę" na `/decks/{deckId}`)

---

### 2.9. Globalne komponenty i layouty

Te komponenty nie mają dedykowanych ścieżek, ale są obecne w całej aplikacji.

#### 2.9.1. Nawigacja główna

**Cel**: Zapewnienie dostępu do głównych modułów aplikacji.

**Komponenty**:
- **Na desktopie**: Boczny panel (sidebar) po lewej stronie
  - Width: 240px - 280px
  - Fixed position
  - **Logo aplikacji** (na górze)
  - **Linki nawigacyjne** (lista):
    - "Dashboard" (ikona: home) → `/dashboard`
    - "Moje talie" (ikona: layers/cards) → `/decks`
    - "Utwórz talię" (ikona: plus) → `/decks/new`
  - **Przycisk "Wyloguj"** (na dole panelu):
    - Ikona: logout/sign-out
    - Wywołuje wylogowanie Supabase Auth, przekierowanie do `/login`
  - **Link "Zaloguj się"** (dla niezalogowanych, opcjonalnie w MVP):
    - Na dole panelu (zamiast "Wyloguj")
    - Prowadzi do `/login`

- **Na mobile**: Menu zwijane do ikony "hamburger"
  - **Hamburger icon** (top-left, header):
    - Otwiera/zamyka menu (slide-in animation)
  - **Slide-in menu** (overlay, full-height):
    - Backdrop (dark, semi-transparent)
    - Menu panel (slide from left)
    - **Logo aplikacji** (na górze)
    - **Linki nawigacyjne** (te same co desktop)
    - **Przycisk "Wyloguj"** (na dole)
  - Zamknięcie menu: kliknięcie poza menu (backdrop) lub ikona X

**UX, dostępność**:
- Active link highlighting (bieżąca strona wyróżniona kolorem lub tłem)
- Hover effects na linkach
- Keyboard navigation: Tab przez linki, Enter do aktywacji
- Aria labels dla linków i przycisków
- Mobile menu: focus trap, zamknięcie przez ESC

#### 2.9.2. Layout dla zalogowanych użytkowników

**Plik**: `DashboardLayout.astro` (lub podobny)

**Struktura**:
- **Nawigacja główna** (sidebar na desktop, hamburger na mobile)
- **Main content area** (po prawej stronie na desktop, full-width na mobile):
  - **Header** (opcjonalnie):
    - Breadcrumbs (jeśli stosowane)
    - User info (avatar, email) w prawym górnym rogu
  - **Content** (slot dla zawartości strony)
- **Globalne komponenty** (overlay/fixed):
  - **Toast notifications** (top-right corner, stack):
    - Auto-dismiss po 5-7 sekundach
    - Możliwość ręcznego zamknięcia (ikona X)
  - **Global loader** (fullscreen overlay, opcjonalnie):
    - Spinner podczas długich operacji
    - Aria-live dla komunikatów o statusie
  - **Offline banner** (top lub bottom, fixed):
    - Wyświetlany, gdy brak połączenia z siecią
    - Tekst: "Jesteś offline. Niektóre funkcje mogą być niedostępne."
    - Kolor: orange/yellow
    - Zamknięcie: automatyczne po powrocie online

**UX, dostępność**:
- Responsywny layout: sidebar znika na mobile, pojawia się hamburger
- Skip to main content link (dla screen readers)
- Focus management między nawigacją a treścią

#### 2.9.3. Toast Notifications

**Cel**: Wyświetlanie komunikatów o sukcesie, błędach, informacji.

**Typy**:
- **Success** (zielony): "Talia zapisana!", "Fiszka dodana!"
- **Error** (czerwony): "Nie udało się zapisać talii", "Błąd połączenia"
- **Info** (niebieski): "Sesja wygasła. Zaloguj się ponownie."
- **Warning** (żółty/pomarańczowy): "Jesteś offline"

**Komponenty**:
- Ikona (checkmark, X, info, warning)
- Tytuł (opcjonalnie)
- Treść (krótki komunikat, 1-2 zdania)
- Przycisk zamknięcia (ikona X)
- Auto-dismiss timer (progress bar na dole toasta, opcjonalnie)

**UX, dostępność**:
- Stack w prawym górnym rogu (najnowsze na górze)
- Animacja wejścia/wyjścia (slide-in, fade-out)
- Aria-live="polite" dla info/success, aria-live="assertive" dla error
- Keyboard: focus na toast, Tab do przycisku zamknięcia, Enter/Space do zamknięcia, ESC zamyka wszystkie toasty

#### 2.9.4. Offline Banner

**Cel**: Informowanie użytkownika o braku połączenia z siecią.

**Komponenty**:
- Fixed banner (top lub bottom)
- Ikona: wifi off
- Tekst: "Jesteś offline. Niektóre funkcje mogą być niedostępne."
- Kolor tła: orange/yellow

**UX, dostępność**:
- Wyświetlany tylko, gdy `window.navigator.onLine === false`
- Znika automatycznie po powrocie online
- Aria-live="polite"
- Nie przesłania zawartości (fixed position, nie wpływa na layout)

---

## 3. Mapa podróży użytkownika

### 3.1. Przepływ: Nowy użytkownik - Rejestracja i pierwsze logowanie

1. Użytkownik trafia na `/login` (np. z landing page lub bezpośredniego URL)
2. Nie ma konta → klika "Zarejestruj się" → `/register`
3. Wypełnia formularz rejestracji (email, hasło, potwierdzenie hasła)
4. Klika "Zarejestruj się"
5. System tworzy konto w Supabase Auth
6. **Opcja A**: Przekierowanie do `/login` z toastem "Konto utworzone! Zaloguj się."
7. **Opcja B**: Automatyczne zalogowanie + przekierowanie do `/dashboard`
8. Użytkownik jest teraz na `/dashboard` (stan pusty: brak talii, brak historii)

### 3.2. Przepływ: Generowanie fiszek przez AI

1. Użytkownik jest zalogowany i znajduje się na `/dashboard`
2. Wkleja tekst źródłowy do pola tekstowego (2000-10 000 znaków)
3. Obserwuje licznik znaków (zmienia kolor na zielony po przekroczeniu 2000)
4. Klika "Generuj fiszki"
5. System wyświetla skeleton loader
6. API wysyła żądanie `POST /api/ai/generate` z tekstem
7. **Sukces**: API zwraca listę propozycji fiszek
   - Lista propozycji pojawia się poniżej (przewijana, domyślnie wszystkie zaznaczone)
8. **Błąd**: API zwraca błąd (400, 503, timeout)
   - Wyświetlany komunikat o błędzie + przycisk "Spróbuj ponownie"
   - Użytkownik klika "Spróbuj ponownie" → krok 6
9. Użytkownik recenzuje propozycje:
   - Czyta każdą fiszkę (przód, tył)
   - Akceptuje (checkbox zaznaczony) lub odrzuca (checkbox odznaczony)
   - Edytuje inline treść fiszki (jeśli potrzeba)
   - Obserwuje liczniki znaków (200/500)
10. Po recenzji klika "Zapisz jako talię"
11. System wywołuje `POST /api/ai/save` z zaakceptowanymi fiszkami + metrykami
12. API tworzy nową talię z automatyczną nazwą (YYYY-MM-DD_HH-MM)
13. Toast "Talia zapisana!" + przekierowanie do `/decks/{deckId}`
14. Użytkownik widzi szczegóły nowo utworzonej talii

### 3.3. Przepływ: Ręczne tworzenie talii

1. Użytkownik klika "Utwórz talię" w nawigacji (lub na `/decks` przycisk "Utwórz nową talię")
2. Przechodzi do `/decks/new`
3. Wpisuje nazwę talii (np. "Angielski - Czasowniki nieregularne")
4. Dodaje fiszki:
   - Wpisuje przód fiszki (np. "go")
   - Wpisuje tył fiszki (np. "went, gone")
   - Klika "Dodaj fiszkę"
   - Fiszka pojawia się na liście poniżej
   - Powtarza dla kolejnych fiszek (np. 10-20 fiszek)
5. (Opcjonalnie) Edytuje dodane fiszki:
   - Klika "Edytuj" przy fiszce
   - Modyfikuje treść
   - Klika "Zapisz"
6. Klika "Zapisz talię"
7. System wywołuje `POST /api/decks` z nazwą talii i listą fiszek
8. Toast "Talia utworzona!" + przekierowanie do `/decks/{deckId}` lub `/decks`

### 3.4. Przepływ: Przeglądanie i zarządzanie taliami

1. Użytkownik klika "Moje talie" w nawigacji
2. Przechodzi do `/decks`
3. Widzi responsywną siatkę kart talii (sortowane domyślnie: najnowsze)
4. (Opcjonalnie) Zmienia sortowanie (dropdown: "Najstarsze", "Nazwa A-Z")
5. Klika na kartę talii (lub nazwę talii)
6. Przechodzi do `/decks/{deckId}` (szczegóły talii)
7. Widzi nagłówek talii (nazwa, data, liczba fiszek) i listę fiszek
8. Użytkownik może:
   - **Edytować nazwę talii**:
     - Klika na nazwę talii (lub ikonę ołówka)
     - Wpisuje nową nazwę
     - Klika "Zapisz" → wywołuje `PATCH /api/decks/{deckId}`
     - Toast "Nazwa zaktualizowana"
   - **Dodać nową fiszkę**:
     - Klika "Dodaj fiszkę"
     - Wypełnia formularz (przód, tył)
     - Klika "Dodaj" → wywołuje `POST /api/decks/{deckId}/flashcards`
     - Fiszka pojawia się na liście
   - **Edytować fiszkę**:
     - Klika "Edytuj" przy fiszce
     - Modyfikuje treść inline
     - Klika "Zapisz" → wywołuje `PATCH /api/flashcards/{flashcardId}`
   - **Usunąć fiszkę**:
     - Klika "Usuń" przy fiszce
     - (Opcjonalnie) Potwierdza usunięcie w modalu
     - Wywołuje `DELETE /api/flashcards/{flashcardId}`
     - Fiszka znika z listy
   - **Usunąć całą talię**:
     - Klika "Usuń talię"
     - Potwierdza usunięcie w modalu: "Czy na pewno chcesz usunąć tę talię? Zostaną usunięte wszystkie fiszki. Tej operacji nie można cofnąć."
     - Klika "Usuń" → wywołuje `DELETE /api/decks/{deckId}`
     - Toast "Talia usunięta" + przekierowanie do `/decks`
   - **Rozpocząć naukę**:
     - Klika "Rozpocznij naukę" → przechodzi do przepływu sesji nauki (poniżej)

### 3.5. Przepływ: Sesja nauki

1. Użytkownik klika "Ucz się" przy talii (na `/decks` lub `/decks/{deckId}`)
2. Przechodzi do `/decks/{deckId}/study`
3. System wywołuje `GET /api/decks/{deckId}/review` (pobiera fiszki do powtórki)
4. **Jeśli są fiszki do nauki**:
   - Wyświetla pierwszą fiszkę (przód, stan: ukryty tył)
   - Nagłówek: "Fiszka 1 z X"
5. Użytkownik czyta przód fiszki
6. Klika "Pokaż odpowiedź" (lub Space/Enter)
7. Wyświetla się tył fiszki + przyciski oceny ("Nie wiem", "Wiem", "Bardzo łatwe")
8. Użytkownik ocenia fiszkę:
   - **"Nie wiem"** (quality: "again"): Najtrudniejsza ocena, krótki interwał
   - **"Wiem"** (quality: "good"): Średnia ocena, normalny interwał
   - **"Bardzo łatwe"** (quality: "easy"): Najłatwiejsza ocena, długi interwał
9. System wywołuje `POST /api/reviews` z `flashcard_id` i `quality`
10. API aktualizuje dane SRS fiszki (algorytm SM-2, nowa `due_date`)
11. System przechodzi do kolejnej fiszki:
    - Animacja przejścia (fade out/in, opcjonalnie)
    - Wyświetla następną fiszkę (przód, stan: ukryty tył)
    - Aktualizuje nagłówek: "Fiszka 2 z X"
12. Powtarza kroki 5-11 dla wszystkich fiszek
13. **Po ostatniej fiszce**:
    - Wyświetla modal podsumowania sesji
    - Podsumowanie: liczba przejrzanych fiszek, % poprawnych odpowiedzi, rozkład ocen
    - Użytkownik klika "Zamknij" → powrót do `/decks/{deckId}` lub `/decks`
14. **Jeśli brak fiszek do nauki**:
    - Wyświetla komunikat: "Świetna robota! Nie masz fiszek do powtórki."
    - Przycisk "Wróć do listy talii" → `/decks`

### 3.6. Przepływ: Wylogowanie

1. Użytkownik klika "Wyloguj" w nawigacji
2. System wywołuje Supabase Auth logout
3. Kończy sesję użytkownika
4. Przekierowanie do `/login`
5. Toast: "Zostałeś wylogowany"

### 3.7. Obsługa błędów i przypadków specjalnych

#### Błąd sieci (Network error)
- Toast: "Utracono połączenie z siecią. Sprawdź swoje połączenie i spróbuj ponownie."
- Offline banner (fixed, na górze): "Jesteś offline. Niektóre funkcje mogą być niedostępne."

#### Błąd 401 (Unauthorized)
- Automatyczne wylogowanie
- Przekierowanie do `/login`
- Toast: "Twoja sesja wygasła. Zaloguj się ponownie."

#### Błąd 404 (Not Found)
- Strona 404 lub przekierowanie do głównej strony (`/decks`) z toastem: "Zasób nie został znaleziony"

#### Błąd 400 (Bad Request)
- Toast: "Nieprawidłowe dane. Sprawdź formularz i spróbuj ponownie."

#### Błąd 503 (Service Unavailable - AI)
- Toast: "Usługa AI jest chwilowo niedostępna. Spróbuj ponownie za chwilę."
- Przycisk "Spróbuj ponownie" w interfejsie generowania

---

## 4. Układ i struktura nawigacji

### 4.1. Nawigacja główna

**Typ**: Responsywna nawigacja z sidebarem (desktop) i hamburger menu (mobile)

**Na desktopie (≥ 1024px)**:
- **Sidebar** (boczny panel po lewej stronie):
  - Width: 240px - 280px
  - Fixed position (zawsze widoczny podczas przewijania)
  - Background: Primary brand color lub neutralny (white/gray)
  - **Struktura**:
    - **Logo aplikacji** (na górze, centered lub left-aligned)
    - **Linki nawigacyjne** (vertical stack, spacing: 8px):
      1. **"Dashboard"** → `/dashboard`
         - Ikona: Home (Material Icons: `home`)
         - Active state: tło lub kolor tekstu wyróżniający
      2. **"Moje talie"** → `/decks`
         - Ikona: Layers/Cards (Material Icons: `layers` lub `style`)
      3. **"Utwórz talię"** → `/decks/new`
         - Ikona: Plus (Material Icons: `add_circle_outline`)
    - **Spacer** (flex-grow, wypełnia przestrzeń)
    - **Przycisk "Wyloguj"** (na dole):
      - Ikona: Logout (Material Icons: `logout` lub `exit_to_app`)
      - Color: subtle, secondary

**Na mobile (< 1024px)**:
- **Header** (top bar, fixed):
  - **Hamburger icon** (left):
    - Ikona: Menu (Material Icons: `menu`)
    - Otwiera slide-in menu
  - **Logo aplikacji** (centered)
  - **User icon** (right, opcjonalnie):
    - Otwiera user menu (wyloguj, ustawienia)
- **Slide-in menu** (overlay, slide from left):
  - **Backdrop** (dark, semi-transparent, kliknięcie zamyka menu)
  - **Menu panel**:
    - Width: 280px
    - Background: white/gray
    - **Struktura** (identyczna jak sidebar desktop):
      - Logo aplikacji (na górze)
      - Linki nawigacyjne
      - Przycisk "Wyloguj" (na dole)
    - **Przycisk zamknięcia** (ikona X, top-right)
  - **Animacja**: Slide-in (0.3s ease-out), slide-out (0.2s ease-in)

### 4.2. Nawigacja dla niezalogowanych użytkowników

Dla użytkowników niezalogowanych (na `/login`, `/register`):
- Brak sidebara / hamburger menu
- Prosty layout: centered form na pustym tle (lub z hero image)
- Logo aplikacji na górze formularza
- Linki między `/login` i `/register` w formularzu

### 4.3. Breadcrumbs (opcjonalnie)

Breadcrumbs mogą być wyświetlane w górnej części content area dla głębszych poziomów nawigacji:

- `/decks` → "Moje talie"
- `/decks/{deckId}` → "Moje talie > [Nazwa talii]"
- `/decks/{deckId}/study` → "Moje talie > [Nazwa talii] > Nauka"
- `/decks/new` → "Moje talie > Utwórz talię"

**Implementacja**:
- Horizontal list z separatorami (">")
- Linki do poziomów nadrzędnych
- Ostatni element (bieżąca strona) nie jest linkiem (tylko tekst)

### 4.4. User Menu (opcjonalnie w MVP)

W przyszłości (poza MVP), w prawym górnym rogu może być user menu:
- Avatar użytkownika (inicjały lub zdjęcie)
- Kliknięcie otwiera dropdown:
  - "Profil" → `/profile`
  - "Ustawienia" → `/settings`
  - "Wyloguj" → Akcja wylogowania

### 4.5. Active State i Highlighting

- Link reprezentujący bieżącą stronę jest wyróżniony:
  - Tło: Primary color (light variant)
  - Tekst: Primary color (dark variant) lub white
  - Ikona: Primary color
- Hover effects dla wszystkich linków:
  - Background: light gray
  - Cursor: pointer

---

## 5. Kluczowe komponenty

Te komponenty wielokrotnego użytku będą wykorzystywane w wielu widokach aplikacji.

### 5.1. FlashcardCard

**Opis**: Komponent wyświetlający pojedynczą fiszkę w formie karty.

**Props**:
- `flashcard`: Obiekt fiszki (id, front, back)
- `mode`: "view" | "edit" | "review"
- `onEdit`: Callback dla edycji (opcjonalnie)
- `onDelete`: Callback dla usunięcia (opcjonalnie)
- `onToggleAccept`: Callback dla akceptacji (w trybie review)

**Użycie**:
- Lista propozycji AI (Dashboard)
- Lista fiszek w szczegółach talii (`/decks/{deckId}`)
- Widok fiszki w sesji nauki (`/decks/{deckId}/study`)

**Warianty**:
- **View mode**: Tylko odczyt (przód, tył, bez edycji)
- **Edit mode**: Edycja inline (textarea, liczniki znaków, przyciski "Zapisz"/"Anuluj")
- **Review mode**: Checkbox akceptacji, edycja inline, liczniki znaków

---

### 5.2. DeckCard

**Opis**: Komponent karty talii wyświetlanej w liście talii.

**Props**:
- `deck`: Obiekt talii (id, name, created_at, flashcard_count)
- `onStudy`: Callback dla rozpoczęcia nauki
- `onEdit`: Callback dla edycji
- `onDelete`: Callback dla usunięcia

**Użycie**:
- Lista talii (`/decks`)

**Struktura**:
- Link do `/decks/{deckId}` (card body)
- Nazwa talii (heading)
- Metadane (data, liczba fiszek)
- Przyciski akcji: "Ucz się", "Edytuj", "Usuń"

---

### 5.3. FormField

**Opis**: Komponent pola formularza z walidacją i komunikatami o błędach.

**Props**:
- `label`: Etykieta pola
- `type`: "text" | "email" | "password" | "textarea"
- `name`: Nazwa pola (dla react-hook-form)
- `placeholder`: Placeholder
- `error`: Komunikat błędu (z react-hook-form)
- `maxLength`: Max długość (opcjonalnie, dla licznika znaków)
- `showCharCount`: Boolean, czy pokazywać licznik znaków

**Użycie**:
- Formularze logowania, rejestracji, tworzenia talii, dodawania fiszek

**Struktura**:
- Label (aria-label)
- Input/Textarea
- Licznik znaków (jeśli showCharCount)
- Komunikat błędu (jeśli error, kolor czerwony, ikona alert)

---

### 5.4. Button

**Opis**: Komponent przycisku z wariantami i stanami.

**Props**:
- `variant`: "primary" | "secondary" | "danger" | "ghost"
- `size`: "small" | "medium" | "large"
- `isLoading`: Boolean, czy pokazywać spinner
- `disabled`: Boolean
- `icon`: Opcjonalna ikona (Material Icons)
- `onClick`: Callback

**Użycie**:
- Wszystkie przyciski w aplikacji (formularze, akcje, nawigacja)

**Warianty**:
- **Primary**: Bright color (brand primary), white text
- **Secondary**: Outlined, brand color text
- **Danger**: Red color (dla akcji destrukcyjnych jak "Usuń")
- **Ghost**: Transparent background, text color only (dla akcji trzeciorzędnych)

**Stany**:
- **Loading**: Spinner + disabled
- **Disabled**: Opacity 0.5, cursor not-allowed

---

### 5.5. Modal

**Opis**: Komponent modala (dialog) z backdrop i focus trap.

**Props**:
- `isOpen`: Boolean
- `onClose`: Callback dla zamknięcia
- `title`: Tytuł modala
- `children`: Zawartość modala (React nodes)
- `footer`: Opcjonalna stopka z przyciskami

**Użycie**:
- Potwierdzenie usunięcia (talii, fiszki)
- Edycja nazwy talii (jeśli modal zamiast inline)
- Podsumowanie sesji nauki

**Struktura**:
- Backdrop (dark overlay, kliknięcie zamyka modal)
- Modal panel (centered, white background, shadow)
- Header: Tytuł + przycisk zamknięcia (ikona X)
- Body: Zawartość (children)
- Footer: Przyciski akcji (opcjonalnie)

**Dostępność**:
- Focus trap (focus pozostaje w modalu)
- Aria role="dialog"
- Aria-labelledby dla tytułu
- ESC zamyka modal
- Po zamknięciu focus wraca do elementu, który wywołał modal

---

### 5.6. Toast

**Opis**: Komponent powiadomienia (toast notification).

**Props**:
- `type`: "success" | "error" | "info" | "warning"
- `message`: Treść komunikatu
- `duration`: Czas wyświetlania (ms, domyślnie 5000)
- `onDismiss`: Callback dla zamknięcia

**Użycie**:
- Komunikaty o sukcesie (zapisanie talii, dodanie fiszki)
- Komunikaty o błędach (błędy API, walidacja)
- Komunikaty informacyjne (sesja wygasła, jesteś offline)

**Struktura**:
- Ikona (checkmark, X, info, warning)
- Treść (message)
- Przycisk zamknięcia (ikona X)
- Progress bar (opcjonalnie, dla auto-dismiss)

**Animacja**:
- Slide-in z prawej (0.3s)
- Fade-out (0.2s)

**Dostępność**:
- Aria-live="polite" (dla info/success)
- Aria-live="assertive" (dla error/warning)
- Keyboard: Tab do przycisku zamknięcia, Enter/Space zamyka

---

### 5.7. SkeletonLoader

**Opis**: Komponent placeholdera dla contentu podczas ładowania.

**Props**:
- `type`: "card" | "list" | "text" | "image"
- `count`: Liczba elementów (domyślnie 1)

**Użycie**:
- Lista talii podczas ładowania
- Lista propozycji AI podczas generowania
- Szczegóły talii podczas ładowania

**Struktura**:
- Animacja pulsowania (opacity lub shimmer effect)
- Kształty przypominające docelowy content (prostokąty, linie)

---

### 5.8. OfflineBanner

**Opis**: Komponent banera informującego o braku połączenia.

**Props**:
- `isOnline`: Boolean (z `window.navigator.onLine`)

**Użycie**:
- Layout dla zalogowanych użytkowników (`DashboardLayout.astro`)

**Struktura**:
- Fixed banner (top lub bottom)
- Ikona: wifi off
- Tekst: "Jesteś offline. Niektóre funkcje mogą być niedostępne."
- Background: orange/yellow
- Wyświetlany tylko gdy `isOnline === false`

**Dostępność**:
- Aria-live="polite"

---

### 5.9. CharCounter

**Opis**: Komponent licznika znaków dla textarea/input.

**Props**:
- `current`: Bieżąca liczba znaków
- `max`: Maksymalna liczba znaków
- `showWarning`: Boolean, czy pokazywać ostrzeżenie po przekroczeniu

**Użycie**:
- Wszystkie pola z limitem znaków (przód fiszki, tył fiszki, textarea AI)

**Struktura**:
- Tekst: "X / Y"
- Kolor:
  - Szary (normalny stan)
  - Czerwony (jeśli current > max)
  - Opcjonalnie: zielony (jeśli w zakresie 2000-10000 dla textarea AI)

---

### 5.10. EmptyState

**Opis**: Komponent wyświetlany, gdy brak danych (np. brak talii, brak fiszek).

**Props**:
- `title`: Tytuł (np. "Nie masz jeszcze żadnych talii")
- `description`: Opis (np. "Zacznij od wygenerowania fiszek przez AI")
- `icon`: Ikona (Material Icons)
- `action`: Przycisk CTA (opcjonalnie)

**Użycie**:
- Lista talii (brak talii)
- Szczegóły talii (brak fiszek)
- Sesja nauki (brak fiszek do powtórki)

**Struktura**:
- Ilustracja lub ikona (large, centered)
- Tytuł (heading)
- Opis (paragraph)
- Przycisk CTA (opcjonalnie)

---

## 6. Mapowanie wymagań do elementów UI

| Wymaganie funkcjonalne (PRD) | Widok / Komponent | Elementy UI |
|------------------------------|-------------------|-------------|
| **Generowanie fiszek przez AI (2000-10 000 znaków)** | Dashboard (`/dashboard`) | Textarea z walidacją, licznik znaków (CharCounter), komunikaty błędów (inline), przycisk "Generuj fiszki" |
| **Oczyszczanie i walidacja tekstu** | Dashboard | Walidacja Zod (client-side), oczyszczanie przed wysłaniem do API (trim, normalizacja) |
| **Recenzja propozycji: akceptacja, edycja inline, odrzucenie** | Dashboard (lista propozycji) | FlashcardCard (review mode), checkbox akceptacji, textarea edytowalne inline, liczniki znaków, przyciski "Usuń" |
| **Zapis propozycji jako talia z automatyczną nazwą** | Dashboard | Przycisk "Zapisz jako talię", wywołanie `POST /api/ai/save`, automatyczna nazwa (YYYY-MM-DD_HH-MM), przekierowanie do `/decks/{deckId}` |
| **Ręczne tworzenie fiszek: wprowadzanie front/back** | `/decks/new` | FormField (textarea) dla przodu i tyłu, liczniki znaków, przycisk "Dodaj fiszkę", lista dodanych fiszek |
| **Ręczne tworzenie fiszek: nadawanie nazwy talii** | `/decks/new` | FormField (input text) dla nazwy talii |
| **Ręczne tworzenie fiszek: zapis jako talia** | `/decks/new` | Przycisk "Zapisz talię", wywołanie `POST /api/decks` |
| **Lista talii: wyświetlanie nazwy, daty, liczby fiszek** | `/decks` | DeckCard (responsywna siatka), wyświetlanie metadanych (name, created_at, flashcard_count) |
| **Lista talii: link do szczegółów talii** | `/decks` | DeckCard (card body jako link do `/decks/{deckId}`) |
| **Edycja nazwy talii** | `/decks/{deckId}` | Edycja inline lub modal, FormField, przycisk "Zapisz", wywołanie `PATCH /api/decks/{deckId}` |
| **Usuwanie talii (z potwierdzeniem)** | `/decks`, `/decks/{deckId}` | Przycisk "Usuń", Modal potwierdzenia, wywołanie `DELETE /api/decks/{deckId}` |
| **Moduł nauki: sesja oparta na SM-2** | `/decks/{deckId}/study` | Widok fiszki (FlashcardCard w trybie study), przycisk "Pokaż odpowiedź", przyciski oceny ("Nie wiem", "Wiem", "Bardzo łatwe"), wywołanie `POST /api/reviews` |
| **Moduł nauki: 3 oceny** | `/decks/{deckId}/study` | Przyciski oceny mapujące na quality: "again", "good", "easy" |
| **Moduł nauki: podsumowanie sesji** | Modal (po sesji nauki) | Modal z podsumowaniem (liczba fiszek, % poprawnych, rozkład ocen), przyciski "Zamknij", "Rozpocznij ponownie" |
| **Uwierzytelnianie: rejestracja** | `/register` | FormField (email, hasło, potwierdzenie), walidacja Zod, przycisk "Zarejestruj się", toast dla błędów API |
| **Uwierzytelnianie: logowanie** | `/login` | FormField (email, hasło), walidacja Zod, przycisk "Zaloguj się", toast dla błędów API |
| **Uwierzytelnianie: wylogowanie** | Nawigacja (przycisk "Wyloguj") | Przycisk "Wyloguj" w sidebara, wywołanie Supabase Auth logout, przekierowanie do `/login` |
| **Obsługa błędów API AI: komunikaty i opcja ponowienia** | Dashboard (stan błędu) | Komunikat o błędzie (mapowanie kodów błędów), przycisk "Spróbuj ponownie", toast notifications |

---

## 7. Względy UX, dostępności i bezpieczeństwa

### 7.1. User Experience (UX)

- **Responsywność**: Wszystkie widoki w pełni responsywne (mobile-first approach), z wykorzystaniem breakpointów Tailwind CSS.
- **Feedback wizualny**: Loading states (spinnery, skeleton loaders), toast notifications, animacje przejść (subtle, bez motion sickness).
- **Liczniki znaków**: W czasie rzeczywistym dla wszystkich pól z limitami (przód, tył, textarea AI), zmiana koloru po przekroczeniu limitu.
- **Walidacja formularzy**: Inline errors pod polami, walidacja onBlur i onChange, blokada przycisków "Zapisz" po błędach walidacji.
- **Komunikaty o błędach**: Przyjazne dla użytkownika, mapowanie kodów błędów API (400, 404, 503) na czytelne komunikaty.
- **Stany puste (Empty states)**: Komunikaty z sugestiami akcji dla nowych użytkowników lub pustych list.
- **Potwierdzenia**: Dla akcji destrukcyjnych (usuwanie talii, fiszki) - modal z potwierdzeniem.
- **Postęp**: Wizualizacja postępu sesji nauki (progress bar, licznik "X z Y").
- **Keyboard shortcuts**: Space/Enter dla "Pokaż odpowiedź", 1/2/3 dla ocen w sesji nauki, Ctrl+Enter dla dodawania fiszek (opcjonalnie).

### 7.2. Dostępność (Accessibility)

- **Semantyczny HTML**: Użycie odpowiednich tagów (`<nav>`, `<main>`, `<button>`, `<a>`, headings hierarchy).
- **Aria labels**: Dla wszystkich interaktywnych elementów (przyciski, linki, pola formularzy).
- **Aria-live**: Dla dynamicznych komunikatów (toast notifications, statusy zapisu, offline banner).
- **Keyboard navigation**: Pełna obsługa klawiatury (Tab, Arrow keys, Enter, Space, ESC).
- **Focus management**: Focus trap w modalach, focus na pierwszym polu w formularzach, focus wraca do wywołującego elementu po zamknięciu modala.
- **Kontrast kolorów**: Zgodność z WCAG 2.1 AA (min. 4.5:1 dla tekstu, 3:1 dla large text).
- **Skip to main content**: Link dla screen readers do pominięcia nawigacji.
- **Teksty alternatywne**: Dla wszystkich ikon i ilustracji (alt text, aria-label).

### 7.3. Bezpieczeństwo (Security)

- **HTTPS**: Cała aplikacja serwowana przez HTTPS.
- **Walidacja client-side**: Zod dla wszystkich formularzy (pierwsza linia obrony).
- **Walidacja server-side**: API również waliduje dane (Zod na backendzie).
- **Sanity check**: Oczyszczanie tekstu ze zbędnych znaków, XSS prevention (sanitization HTML entities).
- **Autoryzacja**: JWT tokens (Supabase Auth), RLS policies w bazie danych (Row-Level Security).
- **Komunikaty o błędach**: Nie ujawniają szczegółów technicznych (np. "Nieprawidłowy email lub hasło" zamiast "Email nie istnieje").
- **Rate limiting**: (Backend) Ochrona przed abuse dla endpointów AI.
- **CORS**: (Backend) Konfiguracja CORS dla API.
- **CSP**: (Backend) Content Security Policy headers.

---

## 8. Strategia zarządzania stanem

### 8.1. Stan serwera (API state)

- **Biblioteka**: React Query (lub SWR)
- **Użycie**:
  - Pobieranie danych z API (GET endpoints)
  - Mutacje (POST, PATCH, DELETE endpoints)
  - Cache'owanie odpowiedzi
  - Obsługa stanów: loading, error, success
  - Optymistyczne aktualizacje (np. usuwanie talii)
  - Automatyczne refetching po mutacjach (invalidate queries)
- **Konfiguracja**:
  - `staleTime`: 5 minut (dane traktowane jako aktualne przez 5 min)
  - `cacheTime`: 10 minut (dane w cache przez 10 min po ostatnim użyciu)
  - `refetchOnWindowFocus`: true (refetch po powrocie do okna)
  - `retry`: 2 (dwie próby ponowienia dla GET)

### 8.2. Stan klienta (Local state)

- **Biblioteka**: React useState, useReducer
- **Użycie**:
  - Stan formularzy (react-hook-form)
  - Stan modali (otwarty/zamknięty)
  - Stan nawigacji mobile (hamburger menu otwarty/zamknięty)
  - Stan edycji inline (tryb edycji dla fiszki/nazwy talii)

### 8.3. Stan sesji nauki (Session storage)

- **Przechowywanie**: `sessionStorage`
- **Użycie**:
  - Lista fiszek do powtórki w bieżącej sesji nauki
  - Indeks bieżącej fiszki
  - Oceny użytkownika (dla podsumowania)
- **Cel**: Przetrwanie odświeżenia strony podczas sesji nauki
- **Czyszczenie**: Po zakończeniu sesji (modal podsumowania, przycisk "Zamknij")

### 8.4. Stan offline (Network state)

- **Wykrywanie**: `window.navigator.onLine`
- **Użycie**:
  - Wyświetlanie offline banner
  - Wyłączenie funkcji wymagających API (generowanie AI, synchronizacja)
- **React Query**: Automatyczna obsługa offline mode (retry po powrocie online)

---

## 9. Podsumowanie

Architektura UI aplikacji 10xdevsFishcards została zaprojektowana z myślą o intuicyjności, responsywności i dostępności. Kluczowe cechy:

1. **9 głównych widoków** pokrywających pełny przepływ użytkownika: od rejestracji, przez generowanie fiszek AI, ręczne tworzenie, zarządzanie taliami, aż po sesję nauki.
2. **Responsywna nawigacja**: Sidebar na desktopie, hamburger menu na mobile.
3. **Spójny design system**: Wykorzystanie Shadcn/ui i Google Material Design dla elementów UI.
4. **Zarządzanie stanem**: React Query dla stanu API, sessionStorage dla sesji nauki.
5. **Dostępność**: Zgodność z WCAG 2.1, keyboard navigation, aria labels, focus management.
6. **UX**: Inline validation, loading states, toast notifications, empty states, potwierdzenia dla akcji destrukcyjnych.
7. **Bezpieczeństwo**: Client-side i server-side validation, JWT auth, RLS policies, XSS prevention.
8. **Komponenty wielokrotnego użytku**: FlashcardCard, DeckCard, FormField, Button, Modal, Toast, SkeletonLoader, EmptyState.

Architektura jest zgodna z planem API i spełnia wszystkie wymagania z PRD oraz decyzje z sesji planowania UI.
