# Dokument wymagań produktu (PRD) - 10xdevsFishcards
## 1. Przegląd produktu
10xdevsFishcards to aplikacja webowa umożliwiająca automatyzację tworzenia fiszek edukacyjnych przy użyciu sztucznej inteligencji. Użytkownik wkleja tekst źródłowy, otrzymuje wygenerowane propozycje fiszek, recenzuje je i zapisuje jako nową talię. Dodatkowo dostępne jest ręczne tworzenie fiszek oraz prosty moduł nauki oparty na algorytmie SM-2. System uwierzytelniania i przechowywania danych oparto na Supabase.

## 2. Problem użytkownika
Manualne tworzenie wysokiej jakości fiszek jest czasochłonne i wymaga dużego nakładu pracy, co obniża motywację do korzystania z metody spaced repetition. Użytkownicy potrzebują szybkiego, prostego narzędzia, które zautomatyzuje ten proces i umożliwi skupienie się na nauce.

## 3. Wymagania funkcjonalne
- Generowanie fiszek przez AI na podstawie wklejonego tekstu (2000–10 000 znaków)
- Oczyszczanie ze zbędnych pustych znaków i walidacja tekstu wejściowego pod kątem bezpieczeństwa przed wysłaniem do API AI
- Recenzja propozycji fiszek: akceptacja, edycja inline (przód do 200 znaków, tył do 500 znaków) lub odrzucenie
- Zapis zaakceptowanych fiszek jako nowa talia z automatycznie wygenerowaną nazwą bazującą na dacie i czasie
- Ręczne tworzenie fiszek: sesja tworzenia nowej talii, wpisywanie front/back
- Przeglądanie listy talii: nazwa, data utworzenia, liczba fiszek
- Edycja nazwy talii i trwałe usuwanie talii
- Moduł nauki: sesja oparta na algorytmie SM-2 z trzema ocenami („Nie wiem”, „Wiem”, „Bardzo łatwe”)
- System uwierzytelniania i autoryzacji użytkowników oparty na Supabase (rejestracja, logowanie, wylogowanie)
- Obsługa błędów API AI i komunikacja z użytkownikiem (timeout, błąd formatu, limit znaków)

## 4. Granice produktu
W MVP nie obejmujemy:
- Własnego, zaawansowanego algorytmu powtórek (jak FSRS, Anki)
- Importu wielu formatów plików (PDF, DOCX, itp.)
- Współdzielenia talii lub kolaboracji między użytkownikami
- Integracji z innymi platformami edukacyjnymi
- Aplikacji mobilnych
- Rozbudowanych statystyk i raportów postępów
- Mechanizmów płatności i subskrypcji
- Cache’owania wyników zapytań do AI

## 5. Historyjki użytkowników
### US-001
Tytuł: Rejestracja i logowanie użytkownika
Opis: Jako nowy użytkownik chcę założyć konto oraz zalogować się, aby korzystać z funkcji chronionych aplikacji.
Kryteria akceptacji:
- Użytkownik może podać e-mail i hasło, otrzymuje potwierdzenie rejestracji
- Po rejestracji lub logowaniu następuje przekierowanie do pulpitu użytkownika
- Próba dostępu do chronionych funkcji bez zalogowania powoduje przekierowanie do strony logowania

### US-002
Tytuł: Wylogowanie użytkownika
Opis: Jako zalogowany użytkownik chcę móc się wylogować, aby chronić swoje dane.
Kryteria akceptacji:
- Kliknięcie przycisku Wyloguj kończy sesję i przekierowuje do strony logowania
- Po wylogowaniu zabezpieczone endpointy są niedostępne

### US-003
Tytuł: Generowanie fiszek przez AI
Opis: Jako zalogowany użytkownik chcę wkleić blok tekstu (2000–10 000 znaków) i wygenerować propozycje fiszek.
Kryteria akceptacji:
- System weryfikuje długość tekstu i wyświetla komunikat o przekroczeniu limitu
- Wysłanie prawidłowego tekstu powoduje wywołanie API AI i zwrócenie listy propozycji fiszek
- W razie błędu API wyświetlany jest czytelny komunikat z opcją ponowienia próby

### US-004
Tytuł: Recenzja i edycja propozycji fiszek
Opis: Jako użytkownik chcę akceptować, edytować lub odrzucać wygenerowane fiszki przed zapisaniem.
Kryteria akceptacji:
- Lista fiszek wyświetla pola przód/tył gotowe do inline’owej edycji
- Domyślnie wszystkie fiszki są zaznaczone jako zaakceptowane
- Użytkownik może odznaczyć lub zmodyfikować dowolną fiszkę
- Odrzucone fiszki nie zostaną zapisane

### US-005
Tytuł: Zapis zaakceptowanych fiszek jako talia
Opis: Jako użytkownik chcę jednym kliknięciem zapisać zaakceptowane fiszki jako nową talię z automatyczną nazwą.
Kryteria akceptacji:
- Po kliknięciu Zapisz system tworzy nową talię z nazwą w formacie YYYY-MM-DD_HH-MM
- Użytkownik trafia do widoku szczegółów talii z listą zapisanych fiszek

### US-006
Tytuł: Ręczne tworzenie fiszek
Opis: Jako użytkownik chcę tworzyć fiszki samodzielnie, wpisując front i back.
Kryteria akceptacji:
- Użytkownik otwiera widok ręcznego wprowadzania i wpisuje wartości pól
- Po zakończeniu sesji system zapisuje fiszki jako nową talię

### US-007
Tytuł: Przeglądanie talii
Opis: Jako użytkownik chcę zobaczyć listę moich talii wraz z podstawowymi informacjami.
Kryteria akceptacji:
- Widok listy talii pokazuje nazwę, datę utworzenia i liczbę fiszek
- Talia jest linkiem do szczegółów

### US-008
Tytuł: Edycja nazwy talii
Opis: Jako użytkownik chcę zmienić nazwę istniejącej talii, aby lepiej ją opisać.
Kryteria akceptacji:
- Użytkownik klika przycisk Edytuj nazwę, wprowadza nową wartość i zapisuje
- Nowa nazwa wyświetla się w widoku listy i szczegółów talii

### US-009
Tytuł: Usuwanie talii
Opis: Jako użytkownik chcę trwale usunąć niepotrzebną talię.
Kryteria akceptacji:
- Kliknięcie Usuń wyświetla potwierdzenie operacji
- Po potwierdzeniu talia jest usuwana i znika z listy

### US-010
Tytuł: Rozpoczęcie sesji nauki
Opis: Jako użytkownik chcę wybrać talię i rozpocząć sesję powtórek.
Kryteria akceptacji:
- Użytkownik klika Start nauki przy wybranej talii
- Wyświetla się pierwsza fiszka gotowa do oceny

### US-011
Tytuł: Ocena fiszki w sesji nauki
Opis: Jako użytkownik chcę ocenić każdą fiszkę trzema opcjami: Nie wiem, Wiem, Bardzo łatwe.
Kryteria akceptacji:
- Po odsłonięciu odpowiedzi użytkownik wybiera jeden z trzech przycisków
- System zapisuje ocenę i wyznacza kolejną datę powtórki wg SM-2
- Po ostatniej fiszce sesja się kończy i wyświetla podsumowanie

### US-012
Tytuł: Obsługa błędów API AI
Opis: Jako użytkownik chcę otrzymać czytelne komunikaty i możliwość ponowienia próby, gdy generowanie fiszek się nie powiedzie.
Kryteria akceptacji:
- W przypadku błędu sieci lub serwera wyświetlany jest komunikat z przyciskiem Powtórz
- Po kliknięciu Powtórz następuje ponowna próba wywołania API

## 6. Metryki sukcesu
- 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkowników w procesie recenzji
- 75% wszystkich utworzonych fiszek pochodzi z generatora AI

