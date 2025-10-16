<conversation_summary>
<decisions>
1.  **Nawigacja**: Zostanie zaimplementowana responsywna nawigacja. Na desktopie będzie to boczny panel, a na urządzeniach mobilnych menu zwijane do ikony "hamburger". Menu mobilne będzie zawierać te same linki co panel boczny.
2.  **Generowanie Fiszki AI**: Widok będzie zawierał centralne pole tekstowe. Po wygenerowaniu, propozycje fiszek pojawią się poniżej w formie przewijanej listy z nawigacją za pomocą strzałek.
3.  **Walidacja Formularzy**: Walidacja będzie oparta na `react-hook-form` z integracją Zod. Błędy będą wyświetlane inline pod polami. Zostanie dodany licznik znaków, który zmienia kolor po przekroczeniu limitu i blokuje zapis.
4.  **Lista Talii**: Widok listy talii będzie responsywny: jednokolumnowy na mobile, dwukolumnowy na tabletach i 3-4 kolumnowy na desktopach. Każda karta talii będzie zawierać przyciski akcji: "Ucz się", "Edytuj" i "Usuń".
5.  **Sesja Nauki (UI)**: Interfejs sesji nauki zostanie przygotowany, ale bez pełnej implementacji backendowej w MVP. Domyślnie widoczny będzie przód fiszki, z przyciskiem "Pokaż odpowiedź" odsłaniającym tył i przyciski oceny.
6.  **Podsumowanie Sesji Nauki**: Po zakończeniu sesji wyświetlony zostanie prosty modal z podsumowaniem (liczba fiszek, % poprawnych odpowiedzi).
7.  **Ręczne Tworzenie Talii**: Powstanie dedykowany widok, gdzie użytkownik będzie mógł dodawać fiszki do listy, nadać nazwę talii i zapisać ją za pomocą `POST /api/decks`.
8.  **Szczegóły Talii**: Widok szczegółów talii będzie zawierał listę fiszek z opcjami edycji inline oraz usuwania pojedynczych fiszek.
9.  **Zarządzanie Stanem**: Stan API będzie zarządzany przez React Query (lub SWR). Stan tymczasowej sesji nauki będzie przechowywany w `sessionStorage`, aby przetrwać odświeżenie strony.
10. **Obsługa Błędów i Offline**: Zostaną zaimplementowane globalne wskaźniki ładowania (spinner) i powiadomienia (toasty) w głównym layoucie. Tryb offline będzie sygnalizowany za pomocą bannera.
11. **Metryki AI**: Metryki dotyczące skuteczności AI będą zbierane w tle, bez prezentacji w UI w ramach MVP.
12. **Nawigacja logowania**: Do nawigacji zostanie dodany link "Zaloguj się", który na razie nie będzie zintegrowany z backendem. Będzie on umieszczony na dole panelu nawigacyjnego.
</decisions>
<matched_recommendations>
1.  Zaimplementować responsywną nawigację, która na desktopie jest widoczna jako boczny panel, a na mobile zwija się do ikony "hamburger".
2.  Zaprojektować stany UI (ładowanie, błąd, sukces) dla komponentu AI, używając skeleton loaderów, komunikatów o błędach z opcją "Ponów" oraz przewijanej listy dla propozycji.
3.  Wyświetlać komunikaty o błędach walidacji bezpośrednio pod polami formularza, uruchamiając walidację przy `onBlur` i `onChange`.
4.  Stosować responsywne układy siatki (grid) dla widoku listy talii w zależności od rozmiaru ekranu.
5.  Użyć atrybutów `aria-live` do ogłaszania statusu zapisu i zapewnić pełną dostępność interaktywnych elementów z klawiatury.
6.  Umieścić globalne komponenty (loader, toasty) w głównym pliku layoutu (`DashboardLayout.astro`), aby były niezależne od renderowanej strony.
7.  Wykorzystać `sessionStorage` do przechowywania stanu bieżącej sesji nauki, aby przetrwał odświeżenie strony.
8.  Zmapować kody błędów API (np. 400, 404, 503) na przyjazne dla użytkownika komunikaty.
9.  Wyświetlać stały (fixed) banner na górze lub na dole ekranu, informujący o trybie offline bez przesuwania zawartości strony.
10. Skonfigurować strategię buforowania w React Query z konkretnymi wartościami `staleTime` i `cacheTime` dla zasobów API.
11. Dodać link "Zaloguj się" w nawigacji, który w przyszłości obsłuży proces autoryzacji.
</matched_recommendations>
<ui_architecture_planning_summary>
Na podstawie przeprowadzonej dyskusji, architektura UI dla MVP aplikacji 10xdevsFishcards została zaplanowana w następujący sposób:

**a. Główne wymagania dotyczące architektury UI**
Aplikacja zostanie zbudowana w oparciu o Astro 5 z React 19 dla komponentów interaktywnych. Stylizacja będzie realizowana za pomocą Tailwind 4, a biblioteka komponentów Shadcn/ui posłuży jako fundament dla elementów UI, zapewniając spójność i dostępność. Całość zostanie utrzymana w stylistyce Google Material Design. Architektura będzie modułowa, z wyraźnym podziałem na widoki i komponenty.

**b. Kluczowe widoki, ekrany i przepływy użytkownika**
1.  **Nawigacja**: Główna nawigacja będzie zaimplementowana jako boczny panel na desktopie i wysuwane menu "hamburger" na mobile, zapewniając dostęp do kluczowych modułów. Na dole panelu nawigacyjnego znajdzie się link "Zaloguj się", który w przyszłości będzie obsługiwał autoryzację (na razie bez integracji z backendem).
2.  **Dashboard/Strona główna**: Centralny punkt aplikacji, zawierający komponent do generowania fiszek przez AI. Użytkownik wkleja tekst, klika "Generuj", a poniżej pojawia się przewijana lista propozycji do recenzji.
3.  **Recenzja propozycji AI**: Użytkownik może edytować, akceptować lub odrzucać fiszki. Po zakończeniu zapisuje je jako nową talię (`POST /api/ai/save`).
4.  **Ręczne tworzenie talii**: Dedykowany widok do manualnego dodawania fiszek, wpisywania nazwy talii i zapisywania (`POST /api/decks`).
5.  **Lista Talii (`My Decks`)**: Responsywna siatka kart, gdzie każda karta reprezentuje jedną talię i zawiera akcje "Ucz się", "Edytuj", "Usuń". Kliknięcie w kartę prowadzi do szczegółów talii.
6.  **Szczegóły Talii**: Widok zawierający listę wszystkich fiszek w danej talii, z możliwością edycji inline i usuwania pojedynczych fiszek.
7.  **Sesja Nauki**: Interfejs do nauki oparty na pokazywaniu przodu fiszki, odsłanianiu tyłu i ocenie. Funkcjonalność backendowa dla tego modułu nie jest częścią MVP, ale UI zostanie przygotowane.

**c. Strategia integracji z API i zarządzania stanem**
-   **Zarządzanie stanem serwera**: Do komunikacji z API (pobieranie, cachowanie, mutacje danych) zostanie wykorzystana biblioteka React Query lub SWR. Zapewni to obsługę stanów ładowania, błędów oraz optymistyczne aktualizacje.
-   **Zarządzanie stanem klienta**: Prosty stan lokalny (np. otwarcie modali) będzie zarządzany za pomocą haków React. Stan sesji nauki, aby przetrwać odświeżenie strony, będzie przechowywany w `sessionStorage`.
-   **Integracja z API**: Aplikacja będzie komunikować się z udokumentowanymi endpointami REST API. Logika wywołań API zostanie wyizolowana w dedykowanych serwisach lub hakach.

**d. Kwestie dotyczące responsywności, dostępności i bezpieczeństwa**
-   **Responsywność**: Wszystkie widoki, a w szczególności nawigacja i listy/siatki, będą w pełni responsywne, z wykorzystaniem breakpointów Tailwind CSS.
-   **Dostępność (a11y)**: Zostaną zastosowane najlepsze praktyki, w tym semantyczny HTML, atrybuty ARIA (np. `aria-live` do dynamicznych powiadomień) i zarządzanie focusem, zwłaszcza w modalach i dynamicznych formularzach. Komponenty Shadcn/ui pomogą w utrzymaniu wysokiego standardu dostępności.
-   **Bezpieczeństwo**: Chociaż pełna autoryzacja oparta na JWT Supabase nie jest priorytetem w początkowej fazie implementacji UI, architektura zostanie przygotowana na jej wdrożenie (np. poprzez middleware w Astro). Walidacja danych wejściowych po stronie klienta (Zod) będzie stanowić pierwszą linię obrony przed nieprawidłowymi danymi.

**e. Wszelkie nierozwiązane kwestie lub obszary wymagające dalszego wyjaśnienia**
-   Brak.
</ui_architecture_planning_summary>
<unresolved_issues>
[Brak]
</unresolved_issues>
</conversation_summary>

