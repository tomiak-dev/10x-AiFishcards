<conversation_summary>
<decisions>
1. Zdecydowano o nieużywaniu oddzielnej tabeli `profiles` na obecnym etapie i korzystaniu bezpośrednio z wbudowanej tabeli `auth.users`.
2. Zaakceptowano oddzielenie logiki algorytmu powtórek do osobnych tabel: `srs_algorithms` (słownik) i `flashcard_srs_data` (dane per fiszka).
3. Zatwierdzono strukturę, relacje i wartości domyślne dla tabel `srs_algorithms` i `flashcard_srs_data`.
4. Zatwierdzono dodanie kolumny `last_reviewed_at` do tabeli `decks` w celu śledzenia ostatniej aktywności.
5. Zdecydowano o implementacji logiki algorytmu SM-2 jako funkcji w PostgreSQL, a nie w logice aplikacji.
6. Zaakceptowano dodanie kolumny `created_at` do tabeli `flashcards`.
7. Zdecydowano o użyciu typu danych `SMALLINT` zamiast `INTEGER` dla pól `repetition` i `interval` w celu optymalizacji.
8. Potwierdzono, że niezalogowani użytkownicy (`anon`) nie będą mieli dostępu do żadnych tabel aplikacji.
9. Zdecydowano o utworzeniu dedykowanej tabeli `ai_generation_metrics` do śledzenia metryk sukcesu generowania fiszek.
10. Zaakceptowano dodanie kolumny `creation_source` do tabeli `flashcards` w celu rozróżnienia fiszek manualnych od wygenerowanych przez AI.
11. Zdecydowano o użyciu typu `ENUM` (`review_quality`) dla ocen w sesji nauki w celu poprawy czytelności kodu.
12. Odrzucono propozycję dodania kolumny `description` do tabeli `decks`.
    </decisions>

<matched_recommendations>
1. Utworzenie oddzielnych tabel `srs_algorithms` i `flashcard_srs_data` w celu odizolowania logiki algorytmu od danych fiszki, z relacją jeden-do-jednego między `flashcards` a `flashcard_srs_data`.
2. Implementacja logiki algorytmu SM-2 jako funkcji PostgreSQL (`update_srs_data_on_review`), która hermetyzuje obliczenia i aktualizacje, odciążając aplikację kliencką.
3. Utworzenie tabeli `ai_generation_metrics` do logowania sesji generowania fiszek, przechowującej `user_id`, liczbę zaproponowanych i zaakceptowanych fiszek.
4. Dodanie kolumny `creation_source` do tabeli `flashcards` z ograniczeniem `CHECK`, aby śledzić pochodzenie fiszki ('manual' vs 'ai_generated').
5. Zastosowanie polityk bezpieczeństwa na poziomie wiersza (RLS) dla wszystkich tabel, aby zapewnić, że użytkownicy mogą zarządzać (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) wyłącznie własnymi danymi.
6. Utworzenie widoku `flashcards_with_srs`, który łączy tabele `flashcards`, `decks` i `flashcard_srs_data` w celu uproszczenia zapytań po stronie aplikacji.
7. Użycie zoptymalizowanych typów danych, takich jak `SMALLINT` dla pól `interval` i `repetition`, w celu oszczędności miejsca.
8. Zdefiniowanie niestandardowego typu `ENUM` (`review_quality`) dla ocen fiszek, co poprawia czytelność i utrzymanie kodu funkcji SM-2.
9. Zastosowanie `ON DELETE CASCADE` dla klucza obcego `deck_id` w tabeli `flashcards`, aby zapewnić integralność danych przy usuwaniu talii.
   </matched_recommendations>

<database_planning_summary>
Na podstawie przeprowadzonej dyskusji opracowano kompleksowy schemat bazy danych PostgreSQL dla aplikacji MVP, w pełni zintegrowany z Supabase.

**Główne wymagania i schemat:**
Schemat został zaprojektowany w celu obsługi generowania fiszek przez AI, ręcznego tworzenia, przeglądania talii i sesji nauki opartych na algorytmie SM-2. Centralnym punktem jest tabela `auth.users` z Supabase, która identyfikuje właścicieli danych.

**Kluczowe encje i relacje:**
-   `decks`: Główna tabela przechowująca talie użytkownika. Ma relację jeden-do-wielu z `auth.users`.
-   `flashcards`: Przechowuje pojedyncze fiszki. Ma relację wiele-do-jednego z `decks` (`ON DELETE CASCADE`). Zawiera kolumnę `creation_source` do śledzenia metryk.
-   `srs_algorithms` i `flashcard_srs_data`: Dwie tabele oddzielające logikę algorytmu od fiszek. `flashcard_srs_data` ma relację jeden-do-jednego z `flashcards` i przechowuje stan nauki (interwał, powtórzenia, efactor, data następnej powtórki).
-   `ai_generation_metrics`: Tabela do logowania metryk użycia generatora AI, powiązana z użytkownikiem.

**Bezpieczeństwo i Skalowalność:**
-   **Bezpieczeństwo**: Wszystkie tabele aplikacji (`decks`, `flashcards`, `flashcard_srs_data`, `ai_generation_metrics`) są chronione przez polityki RLS, które zapewniają, że użytkownicy mają dostęp wyłącznie do swoich zasobów. Rola `authenticated` ma zdefiniowane uprawnienia, podczas gdy rola `anon` nie ma dostępu do danych.
-   **Skalowalność/Wydajność**:
    -   Zastosowano indeksy na wszystkich kluczach obcych (`user_id`, `deck_id`) oraz na kolumnie `due_date` w celu optymalizacji zapytań o fiszki do powtórki.
    -   Logika algorytmu SM-2 została zaimplementowana jako funkcja PostgreSQL, co minimalizuje liczbę zapytań z klienta i zapewnia spójność.
    -   Użycie triggerów do aktualizacji `last_reviewed_at` odciąża aplikację od konieczności wykonywania dodatkowych obliczeń.
    -   Zastosowano zoptymalizowane typy danych (`SMALLINT`).

**Funkcjonalność dodatkowa:**
-   Utworzono widok `flashcards_with_srs` w celu uproszczenia zapytań z frontendu.
-   Zdefiniowano typ `ENUM` dla ocen, co poprawia czytelność i bezpieczeństwo typów.
    </database_planning_summary>

<unresolved_issues>
Brak nierozwiązanych kwestii. Wszystkie punkty zostały omówione, a ich wyniki uwzględniono w finalnym skrypcie SQL.
</unresolved_issues>
</conversation_summary>