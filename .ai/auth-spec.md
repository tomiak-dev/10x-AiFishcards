# Specyfikacja Techniczna: Moduł Autentykacji Użytkowników

## 1. Wprowadzenie

Niniejszy dokument opisuje architekturę i implementację modułu autentykacji, autoryzacji oraz odzyskiwania konta dla aplikacji 10xdevsFishcards. Rozwiązanie bazuje na wymaganiach zdefiniowanych w PRD (US-001, US-002, US-015) oraz na istniejącym stacku technologicznym (Astro, React, Supabase).

## 2. Architektura Interfejsu Użytkownika (Frontend)

### 2.1. Nowe Strony (Astro)

W celu obsługi procesów autentykacji, zostaną utworzone następujące strony w katalogu `src/pages`:

-   `src/pages/login.astro`: Strona logowania.
-   `src/pages/register.astro`: Strona rejestracji.
-   `src/pages/forgot-password.astro`: Strona do inicjowania procesu odzyskiwania hasła.
-   `src/pages/reset-password.astro`: Strona, na którą użytkownik jest przekierowywany z linku w mailu, aby ustawić nowe hasło.

Każda z tych stron będzie renderować odpowiedni komponent React odpowiedzialny za logikę formularza.

### 2.2. Layouty i Komponenty Nawigacyjne (Astro)

Layout `src/layouts/Layout.astro` zostanie zmodyfikowany, aby dynamicznie renderować odpowiednie komponenty nawigacyjne w zależności od stanu zalogowania użytkownika.

-   **Komponenty Nawigacyjne:** Utworzone zostaną dwa oddzielne komponenty:
    -   `src/components/nav/GuestNav.astro`: Wyświetlany dla gości, zawierający linki do "Zaloguj się" i "Zarejestruj się".
    -   `src/components/nav/AuthNav.astro`: Wyświetlany dla zalogowanych użytkowników, zawierający linki do "Strona główna", "Moje talie" oraz przycisk "Wyloguj".
-   **Pobieranie sesji:** W części `<script>` layoutu, po stronie serwera, będzie sprawdzana sesja użytkownika przy użyciu `Astro.locals.supabase`. Informacja o sesji (`session`) zostanie przekazana jako `prop` do komponentów nawigacyjnych.

### 2.3. Komponenty (React)

Logika formularzy zostanie zaimplementowana w komponentach React w katalogu `src/components/auth`:

-   `src/components/auth/LoginForm.tsx`: Formularz logowania z polami na e-mail i hasło. Będzie wykorzystywał hook `useForm` (np. z `react-hook-form`) do walidacji i obsługi stanu. Po pomyślnym zalogowaniu, przekieruje użytkownika do `/dashboard` przy użyciu `window.location.href = '/dashboard'`.
-   `src/components/auth/RegisterForm.tsx`: Formularz rejestracji z polami na e-mail i hasło. Po pomyślnej rejestracji wyświetli komunikat (przy użyciu `Sonner`) o konieczności potwierdzenia adresu e-mail.
-   `src/components/auth/ForgotPasswordForm.tsx`: Formularz z polem na e-mail, który wywołuje funkcję Supabase do wysłania linku resetującego hasło. Wyświetli komunikat o powodzeniu.
-   `src/components/auth/ResetPasswordForm.tsx`: Formularz z polem na nowe hasło, który odczytuje token z URL i wysyła żądanie zmiany hasła do Supabase. Po sukcesie przekierowuje na stronę logowania.

### 2.4. Walidacja i Obsługa Błędów

-   **Walidacja Client-Side i Server-Side:** Formularze React będą używać Zod do walidacji pól (np. format e-mail, minimalna długość hasła). Walidacja będzie również powtórzona po stronie serwera w odpowiednich endpointach API dla pełnego bezpieczeństwa. Komunikaty o błędach będą wyświetlane pod odpowiednimi polami.
-   **Obsługa Błędów API:** Błędy zwracane przez Supabase Auth (np. "Invalid login credentials", "User already registered") będą przechwytywane w blokach `catch` i wyświetlane użytkownikowi w formie czytelnych komunikatów przy użyciu komponentu `Sonner`.

### 2.5. Scenariusze Użytkownika

-   **Logowanie:** Użytkownik wypełnia formularz w `LoginForm.tsx`, który wywołuje `supabase.auth.signInWithPassword()`. Po sukcesie następuje przekierowanie do `/dashboard`.
-   **Wylogowanie:** Użytkownik klika przycisk "Wyloguj" w nawigacji. Wywoływana jest funkcja, która wysyła żądanie `POST` do endpointu `/api/auth/logout`. Po pomyślnym wylogowaniu następuje przekierowanie do strony logowania (`/login`).
-   **Rejestracja:** Użytkownik wypełnia `RegisterForm.tsx`, który wywołuje `supabase.auth.signUp()`. Supabase wysyła e-mail z linkiem weryfikacyjnym.
-   **Odzyskiwanie hasła:** Użytkownik podaje e-mail w `ForgotPasswordForm.tsx`, co wywołuje `supabase.auth.resetPasswordForEmail()`. Użytkownik otrzymuje e-mail z linkiem do `/reset-password`. Na tej stronie `ResetPasswordForm.tsx` wywołuje `supabase.auth.updateUser()` z nowym hasłem.

## 3. Logika Backendowa

### 3.1. Nowe Endpointy API

W katalogu `src/pages/api/auth` zostaną utworzone endpointy do obsługi logiki autentykacji po stronie serwera:

-   `src/pages/api/auth/login.ts`: Endpoint obsługujący logowanie.
-   `src/pages/api/auth/register.ts`: Endpoint obsługujący rejestrację.
-   `src/pages/api/auth/logout.ts`: Endpoint obsługujący wylogowanie (usunięcie ciasteczek sesji).
-   `src/pages/api/auth/callback.ts`: Endpoint obsługujący callback od Supabase po potwierdzeniu adresu e-mail.

### 3.2. Middleware

Kluczowym elementem logiki backendowej będzie middleware w `src/middleware/index.ts`. Będzie on odpowiedzialny za:

1.  **Ochronę tras:** Sprawdzanie obecności i ważności sesji (ciasteczka Supabase) dla chronionych stron (np. `/dashboard`, `/decks/*`).
2.  **Przekierowania:**
    -   Jeśli użytkownik **nie jest zalogowany** i próbuje uzyskać dostęp do chronionej strony, zostanie przekierowany do `/login`.
    -   Jeśli użytkownik **jest zalogowany** i próbuje uzyskać dostęp do `/login` lub `/register`, zostanie przekierowany do `/dashboard`.
3.  **Zarządzanie sesją:** Odświeżanie tokenu sesji i udostępnianie klienta Supabase oraz informacji o sesji w `context.locals`, co umożliwi dostęp do nich w endpointach API i na stronach Astro.

### 3.3. Aktualizacja Endpointów API

Istniejące endpointy API (np. w `src/pages/api/decks`) muszą zostać zaktualizowane, aby weryfikować tożsamość użytkownika.

-   Każda funkcja obsługująca żądanie (np. `POST`, `GET`) musi na początku sprawdzić, czy `Astro.locals.session` i `Astro.locals.session.user` istnieją.
-   Jeśli sesja nie istnieje, endpoint powinien zwrócić odpowiedź `401 Unauthorized`.
-   Identyfikator zalogowanego użytkownika (`Astro.locals.session.user.id`) będzie używany w zapytaniach do bazy danych, aby zapewnić, że użytkownicy mają dostęp tylko do swoich danych (np. `select().eq('user_id', userId)`).

### 3.4. Renderowanie Server-Side

Strony takie jak `dashboard.astro` i `decks/[deckId].astro` będą renderowane po stronie serwera (`export const prerender = false;`). W ich części `---` (frontmatter) będzie sprawdzana sesja użytkownika. Jeśli sesja nie istnieje, middleware już na wcześniejszym etapie przekieruje użytkownika, ale dodatkowe sprawdzenie po stronie Astro zapewni spójność.

## 4. System Autentykacji (Supabase Auth)

-   **Konfiguracja:** Klient Supabase (`src/db/supabase.client.ts`) będzie używany zarówno po stronie klienta (w komponentach React), jak i serwera (w middleware i endpointach API). Klucze `SUPABASE_URL` i `SUPABASE_ANON_KEY` będą zarządzane przez zmienne środowiskowe (`.env`).
-   **Provider E-mail:** Supabase będzie skonfigurowany do używania domyślnego providera e-mail do wysyłania linków weryfikacyjnych i resetujących hasło. Szablony tych e-maili zostaną dostosowane w panelu Supabase, aby zawierały prawidłowe linki do frontendu aplikacji.
-   **Bezpieczeństwo:** Wykorzystane zostaną wbudowane mechanizmy Supabase, takie jak ochrona przed atakami CSRF (dzięki ciasteczkom `httpOnly`) oraz bezpieczne przechowywanie haseł. Row Level Security (RLS) w bazie danych zostanie włączone i skonfigurowane tak, aby użytkownicy mieli dostęp wyłącznie do swoich zasobów.
-   **Zarządzanie sesją:** Aplikacja przejdzie na model zarządzania sesją oparty na ciasteczkach, zgodnie z rekomendacjami dla Astro i Supabase. Zastąpi to obecny mechanizm oparty na nagłówku `Authorization: Bearer`.

## 5. Plan wdrożenia RLS (Row Level Security)

Obecnie RLS jest wyłączone. Jest to krytyczna luka w bezpieczeństwie. Poniższy plan opisuje kroki niezbędne do jego włączenia.

1.  **Utworzenie nowej migracji Supabase:** Zostanie dodana migracja SQL, która:
    -   Aktywuje RLS dla tabel `decks` i `flashcards`.
    -   Stworzy polityki (`policies`), które zezwalają na operacje `SELECT`, `INSERT`, `UPDATE`, `DELETE` tylko wtedy, gdy `user_id` w rekordzie jest zgodne z `auth.uid()` zalogowanego użytkownika.
    -   Przykładowa polityka dla talii (`decks`):
        ```sql
        CREATE POLICY "Enable all operations for users based on user_id"
        ON public.decks
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        ```
2.  **Weryfikacja logiki serwisów:** Po włączeniu RLS, wszystkie zapytania w warstwie serwisowej (`src/lib/services`) będą automatycznie objęte politykami bezpieczeństwa. Kod zostanie przejrzany, aby upewnić się, że nie polega już na ręcznym filtrowaniu tam, gdzie RLS jest wystarczające.
