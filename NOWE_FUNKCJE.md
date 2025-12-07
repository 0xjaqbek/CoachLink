# Nowe Funkcjonalności - CoachLink

## 🎯 Dodane funkcje

### 1. 📅 Kalendarz Tygodniowy
**Lokalizacja**: Panel Zawodnika i Trenera → zakładka "Kalendarz"

**Dla trenera:**
- Widok całego tygodnia (poniedziałek - niedziela)
- Wybór treningu z listy i kliknięcie na dzień, aby go zaplanować
- Usuwanie zaplanowanych treningów
- Nawigacja między tygodniami

**Dla zawodnika:**
- Widok zaplanowanych treningów na cały tydzień
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

### Kalendarz (Trener)
1. Przejdź do zakładki "Kalendarz"
2. Wybierz trening z listy rozwijanej
3. Kliknij na dzień, w którym chcesz zaplanować trening
4. Trening pojawi się w kalendarzu

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

- Kalendarz obecnie obsługuje planowanie dla wszystkich zawodników trenera (nie ma jeszcze przypisywania do konkretnego zawodnika)
- Dziennik jest osobisty dla każdego zawodnika
- Statystyki są obliczane na podstawie wpisów w dzienniku
- Zawody mogą być dodawane zarówno przez zawodnika jak i trenera

## 🐛 Możliwe problemy

**Problem**: Nie widzę wpisów w dzienniku
**Rozwiązanie**: Sprawdź czy dodałeś wpisy dla zaplanowanych treningów

**Problem**: Błąd uprawnień Firestore
**Rozwiązanie**: Upewnij się, że zaktualizowałeś reguły bezpieczeństwa w Firebase Console

**Problem**: Brak danych w statystykach
**Rozwiązanie**: Statystyki wymagają wpisów w dzienniku - dodaj kilka wpisów

## 💡 Dalszy rozwój

Możliwe ulepszenia do dodania w przyszłości:
- Przypisywanie treningów do konkretnych zawodników w kalendarzu
- Powiadomienia o nadchodzących treningach
- Export statystyk do PDF
- Porównanie wyników z celami w zawodach
- Wykres postępów czasowych w konkretnych dystansach
