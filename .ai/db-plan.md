# Schemat Bazy Danych PostgreSQL dla 10xdevsFishcards

## 1. Lista Tabel

### `srs_algorithms`
Tabela słownikowa przechowująca dostępne algorytmy Spaced Repetition System.

| Nazwa kolumny | Typ danych | Ograniczenia                               | Opis                                     |
| :------------ | :--------- | :----------------------------------------- | :--------------------------------------- |
| `id`          | `SMALLSERIAL` | `PRIMARY KEY`                              | Unikalny identyfikator algorytmu.        |
| `name`        | `TEXT`     | `NOT NULL`, `UNIQUE`                       | Nazwa algorytmu (np. "SM-2").            |

### `decks`
Tabela przechowująca talie fiszek utworzone przez użytkowników.

| Nazwa kolumny      | Typ danych      | Ograniczenia                                                              | Opis                                                                 |
| :----------------- | :-------------- |:--------------------------------------------------------------------------| :------------------------------------------------------------------- |
| `id`               | `UUID`          | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                                | Unikalny identyfikator talii.                                        |
| `user_id`          | `UUID`          | `NOT NULL`, `REFERENCES auth.users(id)`                                   | Identyfikator użytkownika (właściciela) z tabeli `auth.users`.       |
| `name`             | `TEXT`          | `NOT NULL`                                                                | Nazwa talii.                                                         |
| `created_at`       | `TIMESTAMPTZ`   | `NOT NULL`, `DEFAULT now()`                                               | Data i czas utworzenia talii.                                        |
| `last_reviewed_at` | `TIMESTAMPTZ`   | `DEFAULT now()`                                                           | Data i czas ostatniej sesji nauki dla tej talii.                     |

### `flashcards`
Tabela przechowująca pojedyncze fiszki należące do talii.

| Nazwa kolumny     | Typ danych                               | Ograniczenia                                         | Opis                                                    |
|:------------------| :--------------------------------------- |:-----------------------------------------------------|:--------------------------------------------------------|
| `id`              | `UUID`                                   | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`           | Unikalny identyfikator fiszki.                          |
| `deck_id`         | `UUID`                                   | `NOT NULL`, `REFERENCES decks(id) ON DELETE CASCADE` | Identyfikator talii, do której należy fiszka.           |
| `front`           | `TEXT`                                   | `NOT NULL`, `CHECK (length(front) <= 200)`           | Treść przedniej strony fiszki.                          |
| `back`            | `TEXT`                                   | `NOT NULL`, `CHECK (length(back) <= 500)`            | Treść tylnej strony fiszki.                             |
| `created_at`      | `TIMESTAMPTZ`                            | `NOT NULL`, `DEFAULT now()`                          | Data i czas utworzenia fiszki.                          |
| `changed_at`      | `TIMESTAMPTZ`                            | `NULLABLE`,                                          | Data i czas edycji fiszki.                              |
| `creation_source` | `creation_source_enum`                   | `NOT NULL`, `DEFAULT 'manual'`                       | Źródło utworzenia fiszki ('manual' lub 'ai_generated'). |

### `flashcard_srs_data`
Tabela przechowująca dane algorytmu SRS dla każdej fiszki.

| Nazwa kolumny      | Typ danych      | Ograniczenia                                                              | Opis                                                              |
| :----------------- | :-------------- | :------------------------------------------------------------------------ | :---------------------------------------------------------------- |
| `flashcard_id`     | `UUID`          | `PRIMARY KEY`, `REFERENCES flashcards(id) ON DELETE CASCADE`              | Identyfikator fiszki, z którą powiązane są dane.                  |
| `srs_algorithm_id` | `SMALLINT`      | `NOT NULL`, `DEFAULT 1`, `REFERENCES srs_algorithms(id)`                  | Identyfikator używanego algorytmu SRS.                            |
| `due_date`         | `DATE`          | `NOT NULL`, `DEFAULT CURRENT_DATE`                                        | Data następnej powtórki fiszki.                                   |
| `interval`         | `SMALLINT`      | `NOT NULL`, `DEFAULT 0`, `CHECK (interval >= 0)`                          | Liczba dni do następnej powtórki.                                 |
| `repetition`       | `SMALLINT`      | `NOT NULL`, `DEFAULT 0`, `CHECK (repetition >= 0)`                        | Numer powtórzenia.                                                |
| `efactor`          | `NUMERIC(4, 2)` | `NOT NULL`, `DEFAULT 2.5`, `CHECK (efactor >= 1.3)`                       | Współczynnik łatwości (Easiness Factor).                          |

### `ai_generation_metrics`
Tabela do logowania metryk użycia generatora fiszek AI.

| Nazwa kolumny               | Typ danych    | Ograniczenia                                         | Opis                                                                   |
|:----------------------------| :------------ |:-----------------------------------------------------|:-----------------------------------------------------------------------|
| `id`                        | `BIGSERIAL`   | `PRIMARY KEY`                                        | Unikalny identyfikator wpisu metryki.                                  |
| `user_id`                   | `UUID`        | `NOT NULL`, `REFERENCES auth.users(id)`              | Identyfikator użytkownika, który wygenerował fiszki.                   |
| `created_at`                | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()`                          | Data i czas sesji generowania.                                         |
| `proposed_flashcards_count` | `INTEGER`     | `NOT NULL`, `CHECK (proposed_flashcards_count >= 0)` | Liczba fiszek zaproponowanych przez AI.                                |
| `accepted_flashcards_count` | `INTEGER`     | `NULLABLE`, `CHECK (accepted_flashcards_count >= 0)` | Liczba fiszek zaakceptowanych przez użytkownika.                       |
| `edited_flashcards_count`   | `INTEGER`     | `NULLABLE`, `CHECK (edited_flashcards_count >= 0)`   | Liczba fiszek edytowanych i później zaakceptowanych przez użytkownika. |

## 2. Typy Niestandardowe (ENUM)

### `creation_source_enum`
Określa, czy fiszka została stworzona ręcznie, przez AI, przez AI i później edytowana.
```sql
CREATE TYPE creation_source_enum AS ENUM ('manual', 'ai_generated', 'ai_generated_edited');
```

### `review_quality_enum`
Reprezentuje ocenę użytkownika podczas sesji nauki.
```sql
CREATE TYPE review_quality_enum AS ENUM ('again', 'good', 'easy');
```

## 3. Relacje Między Tabelami

-   **`auth.users` 1 : N `decks`**: Jeden użytkownik może mieć wiele talii.
-   **`decks` 1 : N `flashcards`**: Jedna talia może zawierać wiele fiszek. Relacja jest kaskadowa (`ON DELETE CASCADE`), więc usunięcie talii powoduje usunięcie wszystkich jej fiszek.
-   **`flashcards` 1 : 1 `flashcard_srs_data`**: Każda fiszka ma dokładnie jeden zestaw danych SRS. Usunięcie fiszki usuwa powiązane z nią dane SRS (`ON DELETE CASCADE`).
-   **`srs_algorithms` 1 : N `flashcard_srs_data`**: Jeden algorytm może być używany przez wiele fiszek.
-   **`auth.users` 1 : N `ai_generation_metrics`**: Jeden użytkownik może mieć wiele wpisów metryk generowania.

## 4. Indeksy

-   **`decks`**:
    -   `CREATE INDEX idx_decks_user_id ON decks(user_id);`
-   **`flashcards`**:
    -   `CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);`
-   **`flashcard_srs_data`**:
    -   `CREATE INDEX idx_flashcard_srs_data_due_date ON flashcard_srs_data(due_date);`
-   **`ai_generation_metrics`**:
    -   `CREATE INDEX idx_ai_generation_metrics_user_id ON ai_generation_metrics(user_id);`

## 5. Funkcje i Triggery PostgreSQL

### Funkcja `create_flashcard_srs_data()`
Automatycznie tworzy wpis w `flashcard_srs_data` dla nowej fiszki.
```sql
CREATE OR REPLACE FUNCTION create_flashcard_srs_data()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO flashcard_srs_data (flashcard_id) VALUES (NEW.id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### Trigger `on_flashcard_insert`
Wywołuje funkcję `create_flashcard_srs_data` po dodaniu nowej fiszki.
```sql
CREATE TRIGGER on_flashcard_insert
AFTER INSERT ON flashcards
FOR EACH ROW EXECUTE FUNCTION create_flashcard_srs_data();
```

### Funkcja `update_srs_data_on_review(p_flashcard_id UUID, p_quality review_quality_enum)`
Implementuje logikę algorytmu SM-2 do aktualizacji danych SRS fiszki na podstawie oceny.
```sql
CREATE OR REPLACE FUNCTION update_srs_data_on_review(p_flashcard_id UUID, p_quality review_quality_enum)
RETURNS VOID AS $$
DECLARE
    srs_data flashcard_srs_data;
    quality_val SMALLINT;
BEGIN
    -- Mapowanie ENUM na wartość numeryczną dla algorytmu SM-2
    quality_val := CASE p_quality
        WHEN 'again' THEN 0
        WHEN 'good' THEN 4
        WHEN 'easy' THEN 5
    END;

    SELECT * INTO srs_data FROM flashcard_srs_data WHERE flashcard_id = p_flashcard_id;

    IF quality_val < 3 THEN
        srs_data.repetition := 0;
        srs_data.interval := 1;
    ELSE
        IF srs_data.repetition = 0 THEN
            srs_data.interval := 1;
        ELSIF srs_data.repetition = 1 THEN
            srs_data.interval := 6;
        ELSE
            srs_data.interval := CEIL(srs_data.interval * srs_data.efactor);
        END IF;
        srs_data.repetition := srs_data.repetition + 1;
    END IF;

    srs_data.efactor := GREATEST(1.3, srs_data.efactor + 0.1 - (5 - quality_val) * (0.08 + (5 - quality_val) * 0.02));
    srs_data.due_date := CURRENT_DATE + srs_data.interval;

    UPDATE flashcard_srs_data
    SET
        repetition = srs_data.repetition,
        interval = srs_data.interval,
        efactor = srs_data.efactor,
        due_date = srs_data.due_date
    WHERE flashcard_id = p_flashcard_id;

    -- Aktualizacja daty ostatniej sesji w talii
    UPDATE decks d
    SET last_reviewed_at = now()
    FROM flashcards f
    WHERE d.id = f.deck_id AND f.id = p_flashcard_id;
END;
$$ LANGUAGE plpgsql;
```

## 6. Widoki (Views)

### `flashcards_with_srs`
Upraszcza zapytania po stronie aplikacji, łącząc dane fiszki z jej danymi SRS.
```sql
CREATE OR REPLACE VIEW flashcards_with_srs AS
SELECT
    f.id,
    f.deck_id,
    f.front,
    f.back,
    f.created_at,
    f.creation_source,
    d.user_id,
    srs.due_date,
    srs.interval,
    srs.repetition,
    srs.efactor
FROM
    flashcards f
JOIN
    decks d ON f.deck_id = d.id
JOIN
    flashcard_srs_data srs ON f.id = srs.flashcard_id;
```

## 7. Polityki Bezpieczeństwa (Row-Level Security)

Wszystkie tabele (`decks`, `flashcards`, `flashcard_srs_data`, `ai_generation_metrics`) oraz widok `flashcards_with_srs` mają włączone RLS.

### Polityki dla `decks`
```sql
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Użytkownicy mogą zarządzać tylko swoimi taliami" ON decks
FOR ALL USING (auth.uid() = user_id);
```

### Polityki dla `flashcards`
```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Użytkownicy mogą zarządzać fiszkami w swoich taliach" ON flashcards
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid()
    )
);
```

### Polityki dla `flashcard_srs_data`
```sql
ALTER TABLE flashcard_srs_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Użytkownicy mogą zarządzać danymi SRS swoich fiszek" ON flashcard_srs_data
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM flashcards f
        JOIN decks d ON f.deck_id = d.id
        WHERE f.id = flashcard_srs_data.flashcard_id AND d.user_id = auth.uid()
    )
);
```

### Polityki dla `ai_generation_metrics`
```sql
ALTER TABLE ai_generation_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Użytkownicy mogą zarządzać tylko swoimi metrykami" ON ai_generation_metrics
FOR ALL USING (auth.uid() = user_id);
```

### Polityki dla widoku `flashcards_with_srs`
```sql
ALTER VIEW flashcards_with_srs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Użytkownicy mogą widzieć tylko swoje fiszki w widoku" ON flashcards_with_srs
FOR SELECT USING (auth.uid() = user_id);
```

## 8. Dodatkowe Uwagi

-   **Uwierzytelnianie**: Schemat opiera się na wbudowanej tabeli `auth.users` z Supabase do identyfikacji właścicieli zasobów.
-   **Integralność danych**: Użycie `ON DELETE CASCADE` zapewnia spójność danych przy usuwaniu talii i fiszek.
-   **Brak dostępu dla `anon`**: Domyślnie rola `anon` (niezalogowani użytkownicy) nie ma dostępu do żadnej z tabel dzięki politykom RLS. Uprawnienia (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) należy nadać jawnie roli `authenticated`.

