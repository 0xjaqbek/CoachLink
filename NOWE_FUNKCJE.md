# Nowe Funkcjonalności - CoachLink

## 🎯 Dodane funkcje

### 1. 📅 Kalendarz Tygodniowy (Uaktualnione!)
**Lokalizacja**: Panel Zawodnika i Trenera → zakładka "Kalendarz"

**Dla trenera:**
- **Widok indywidualny zawodnika:** Zakładka "Widok Zawodnika" → wybierz zawodnika → Kalendarz
- Każdy zawodnik ma swój osobisty kalendarz treningów
- Trener ustawia indywidualnie plany dla każdego zawodnika
- Widok całego tygodnia (poniedziałek - niedziela)
- Wybór treningu z listy i kliknięcie na dzień, aby go zaplanować dla wybranego zawodnika
- Usuwanie zaplanowanych treningów
- Nawigacja między tygodniami
- **Kalendarz (Wszyscy):** Widok zbiorczy wszystkich zaplanowanych treningów (tylko podgląd)

**Dla zawodnika:**
- Widok własnych zaplanowanych treningów na cały tydzień
- Oznaczenie dzisiejszego dnia
- Podgląd szczegółów treningu

### 2. 📖 Dziennik Treningowy
**Lokalizacja**: Panel Zawodnika → zakładka "Dziennik"

**Funkcje:**
- Dodawanie wpisów po wykonaniu treningu
- Ocena samopoczucia (1-5)
- Zapisywanie godzin snu
- Notatki po treningu
- Oznaczanie czy trening został wykonany czy opuszczony
- Historia wszystkich wpisów

### 3. 📊 Statystyki
**Lokalizacja**: Panel Zawodnika → zakładka "Statystyki"

**Metryki:**
- Liczba wszystkich treningów
- Liczba wykonanych treningów
- Liczba opuszczonych treningów
- Procent wykonalności
- Średnie samopoczucie
- Średni czas snu
- Wykres aktywności treningowej (ostatnie 14 dni)
- Filtr: tydzień / miesiąc

### 4. 🏊 Zawody i Starty
**Lokalizacja**: Panel Zawodnika → zakładka "Zawody"

**Funkcje:**
- Dodawanie nadchodzących zawodów
- Planowanie startów w konkretnych konkurencjach
- Ustawianie celów czasowych dla każdej konkurencji
- Zapisywanie rzeczywistych wyników
- Historia startów (podzielona na nadchodzące i przeszłe)
- Edycja i usuwanie zawodów

### 5. 📋 Szablony Treningów (NOWE!)
**Lokalizacja**: Panel Trenera → zakładka "Treningi"

**Funkcje:**
- Zapisywanie treningów jako szablonów do ponownego użycia
- Kategorie treningów: Wytrzymałość, Technika, Sprint, Siła, Regeneracja, Mieszany
- Filtrowanie treningów według typu (wszystkie/treningi/szablony)
- Filtrowanie według kategorii
- Wizualna oznaczenie szablonów i kategorii na kartach treningów
- Szybkie tworzenie treningów z gotowych wzorców

### 6. 👀 Widok Zawodnika dla Trenera (NOWE!)
**Lokalizacja**: Panel Trenera → zakładka "Zawodnicy" → kliknij w zawodnika

**Funkcje:**
- Kliknij w kartę zawodnika z listy, aby otworzyć jego szczegóły
- Przycisk "Powrót do listy zawodników" aby wrócić
- **Kalendarz:** Indywidualny kalendarz wybranego zawodnika z możliwością planowania treningów
- **Statystyki:**
  - Liczba treningów (wszystkie/wykonane/opuszczone)
  - Procent wykonalności
  - Średnie samopoczucie
  - Średni czas snu
- **Dziennik:** Podgląd wpisów z dziennika zawodnika
  - Data treningu
  - Samopoczucie i sen
  - Notatki zawodnika
  - Status (wykonany/opuszczony)
- **Zawody:** Lista zawodów zawodnika
  - Nadchodzące i przeszłe zawody
  - Konkurencje z celami i wynikami
  - Notatki do startów

## 🗄️ Nowe kolekcje w Firestore

### scheduledTrainings
Przechowuje zaplanowane treningi w kalendarzu
```javascript
{
  trainingId: string,
  coachId: string,
  athleteId: string | null,
  scheduledDate: string,
  completed: boolean,
  createdAt: string
}
```

### trainingDiaryEntries
Przechowuje wpisy z dziennika treningowego zawodnika
```javascript
{
  athleteId: string,
  scheduledTrainingId: string,
  trainingId: string,
  feeling: number,  // 1-5
  notes: string,
  sleepHours: number | null,
  completed: boolean,
  createdAt: string
}
```

### competitions
Przechowuje informacje o zawodach i startach
```javascript
{
  name: string,
  date: string,
  location: string,
  events: [{ event, targetTime, actualTime, notes }],
  athleteId: string | null,
  coachId: string | null,
  createdAt: string,
  updatedAt: string
}
```

## ⚙️ Wymagana konfiguracja

### 1. Zaktualizuj reguły Firestore

W Firebase Console → Firestore Database → Rules, dodaj nowe reguły (sprawdź README.md lub SETUP_GUIDE.md, sekcja "Reguły Firestore").

Nowe reguły obejmują:
- `scheduledTrainings`
- `trainingDiaryEntries`
- `competitions`

### 2. Indeksy Firestore (opcjonalne, ale zalecane)

Firestore może automatycznie zasugerować potrzebne indeksy podczas pierwszego użycia. Jeśli zobaczysz błąd w konsoli z linkiem do utworzenia indeksu - kliknij ten link i utwórz indeks.

## 🚀 Jak używać

### Szablony Treningów (Trener) - NOWE!
1. Przejdź do zakładki "Treningi"
2. Kliknij "+ Dodaj Trening"
3. Wypełnij formularz treningu
4. Wybierz kategorię (wytrzymałość, technika, sprint, etc.)
5. Zaznacz "Zapisz jako szablon"
6. Kliknij "Utwórz trening"
7. Szablon pojawi się na liście treningów z oznaczeniem "Szablon"
8. Użyj filtrów, aby wyświetlić tylko szablony lub tylko zwykłe treningi

### Widok Zawodnika (Trener) - NOWE!
1. Przejdź do zakładki "Zawodnicy"
2. **Kliknij w kartę zawodnika** z listy
3. Otworzą się szczegóły zawodnika z zakładkami:
   - **Kalendarz:** Planuj treningi dla tego zawodnika
   - **Statystyki:** Zobacz postępy zawodnika
   - **Dziennik:** Przeczytaj notatki i wpisy z treningów
   - **Zawody:** Zobacz zaplanowane i przeszłe zawody
4. Kliknij "← Powrót do listy zawodników" aby wrócić

### Kalendarz Indywidualny (Trener)
1. Przejdź do zakładki "Zawodnicy"
2. **Kliknij w zawodnika** z listy
3. Kliknij zakładkę "Kalendarz" (domyślnie otwarta)
4. Wybierz trening z listy rozwijanej (w tym szablony!)
5. Kliknij na dzień, aby zaplanować trening dla tego zawodnika
6. Trening pojawi się w kalendarzu zawodnika

### Dziennik (Zawodnik)
1. Wykonaj trening
2. Przejdź do zakładki "Dziennik"
3. Kliknij "+ Dodaj wpis"
4. Wybierz trening, oceń samopoczucie, dodaj notatki
5. Zapisz

### Statystyki (Zawodnik)
1. Dodaj kilka wpisów w dzienniku
2. Przejdź do zakładki "Statystyki"
3. Zobacz swoje postępy
4. Przełączaj między widokiem tygodnia a miesiąca

### Zawody (Zawodnik)
1. Przejdź do zakładki "Zawody"
2. Kliknij "+ Dodaj zawody"
3. Wypełnij nazwę, datę, miejsce
4. Dodaj starty (konkurencje) z celami czasowymi
5. Po zawodach - edytuj i dodaj rzeczywiste wyniki

## 📝 Notatki

- **Każdy zawodnik ma swój osobisty kalendarz treningów** - trener ustawia indywidualnie plany
- Trener może przeglądać dane każdego zawodnika z zakładki "Widok Zawodnika"
- Dziennik jest osobisty dla każdego zawodnika, ale trener ma do niego wgląd
- Statystyki są obliczane na podstawie wpisów w dzienniku
- Zawody mogą być dodawane zarówno przez zawodnika jak i trenera
- Szablony treningów są wspólne dla trenera i mogą być użyte dla różnych zawodników
- Kategorie treningów pomagają w organizacji i filtrowaniu planów treningowych

## 🐛 Możliwe problemy

**Problem**: Nie widzę wpisów w dzienniku
**Rozwiązanie**: Sprawdź czy dodałeś wpisy dla zaplanowanych treningów

**Problem**: Błąd uprawnień Firestore
**Rozwiązanie**: Upewnij się, że zaktualizowałeś reguły bezpieczeństwa w Firebase Console

**Problem**: Brak danych w statystykach
**Rozwiązanie**: Statystyki wymagają wpisów w dzienniku - dodaj kilka wpisów

## 💡 Dalszy rozwój

Możliwe ulepszenia do dodania w przyszłości:
- ✅ ~~Przypisywanie treningów do konkretnych zawodników w kalendarzu~~ (ZROBIONE!)
- ✅ ~~Szablony treningów~~ (ZROBIONE!)
- ✅ ~~Kategorie treningów~~ (ZROBIONE!)
- ✅ ~~Widok danych zawodnika dla trenera~~ (ZROBIONE!)
- Powiadomienia o nadchodzących treningach
- Export statystyk do PDF
- Porównanie wyników z celami w zawodach
- Wykres postępów czasowych w konkretnych dystansach
- Kopiowanie szablonów treningów
- Edycja szablonów i automatyczna aktualizacja przyszłych treningów
