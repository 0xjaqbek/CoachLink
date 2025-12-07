# CoachLink - System Treningowy

Aplikacja webowa do zarządzania treningami dla zawodników, trenerów i administratorów.

## Funkcjonalności

### Panel Zawodnika
- **Kalendarz tygodniowy** - widok zaplanowanych treningów na cały tydzień
- **Treningi** - przeglądanie, szczegóły, feedbacki
- **Dziennik treningowy** - zapisywanie wykonanych treningów, samopoczucie, sen, notatki
- **Statystyki** - wykresy postępów, wykonalność, średnie samopoczucie
- **Zawody i starty** - planowanie zawodów, cele czasowe, historia wyników
- **Wiadomości** - czat w czasie rzeczywistym z trenerem
- Szczegółowy widok treningu z ćwiczeniami i multimedia
- Przeglądanie odpowiedzi trenera na feedback

### Panel Trenera
- **Kalendarz tygodniowy** - planowanie treningów dla zawodników
- **Treningi** - tworzenie i edycja strukturyzowanych planów treningowych
- **Feedback** - przeglądanie i odpowiadanie na opinie zawodników
- **Zawodnicy** - lista przypisanych zawodników
- **Wiadomości** - czat z zawodnikami (wybór z listy)
- Dodawanie planów treningowych (serie, dystans, tempo, odpoczynek) - dostosowane do pływania
- Przesyłanie multimediów (zdjęcia, filmy instruktażowe)

### Panel Administratora
- Zarządzanie użytkownikami (dodawanie, usuwanie, zmiana ról)
- Przypisywanie zawodników do trenerów
- Przeglądanie wszystkich treningów w systemie
- Statystyki użytkowników

## Technologie

- **Frontend**: React + Vite
- **Routing**: React Router DOM
- **Backend/Baza danych**: Firebase Firestore
- **Autentykacja**: Firebase Auth (Google Sign-In)
- **Storage**: Firebase Storage (dla multimediów)

## Instalacja

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja Firebase

#### Utwórz projekt Firebase:

1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Kliknij "Add project" lub "Dodaj projekt"
3. Podaj nazwę projektu (np. "coachlink")
4. Postępuj zgodnie z instrukcjami (Analytics opcjonalny)

#### Włącz Google Authentication:

1. W Firebase Console, przejdź do **Authentication** > **Sign-in method**
2. Włącz **Google** jako dostawcę logowania
3. Podaj nazwę projektu widoczną publicznie
4. Wybierz email wsparcia projektu
5. Zapisz

#### Utwórz aplikację webową:

1. W Firebase Console, przejdź do **Project Settings** (ikona koła zębatego)
2. Przewiń w dół do sekcji "Your apps"
3. Kliknij ikonę web `</>`
4. Podaj nazwę aplikacji (np. "CoachLink Web")
5. Zaznacz "Also set up Firebase Hosting" (opcjonalnie)
6. Kliknij "Register app"
7. Skopiuj `firebaseConfig` - będziesz potrzebować tych danych

#### Skonfiguruj Firestore Database:

1. W Firebase Console, przejdź do **Firestore Database**
2. Kliknij "Create database"
3. Wybierz lokalizację (np. europe-west)
4. Zacznij w trybie **test mode** (później zmień na production z właściwymi regułami)
5. Kliknij "Enable"

#### Skonfiguruj Firebase Storage:

1. W Firebase Console, przejdź do **Storage**
2. Kliknij "Get started"
3. Zacznij w trybie **test mode**
4. Kliknij "Done"

#### Dodaj reguły bezpieczeństwa Firestore:

W **Firestore Database** > **Rules**, wklej:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (request.auth.uid == userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /trainings/{trainingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'coach';
      allow update, delete: if request.auth != null &&
        (resource.data.coachId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /feedback/{feedbackId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (resource.data.athleteId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'coach' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /messages/{messageId} {
      allow read: if request.auth != null &&
        (resource.data.senderId == request.auth.uid ||
         resource.data.receiverId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.senderId == request.auth.uid;
    }

    match /scheduledTrainings/{scheduledId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'coach' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /trainingDiaryEntries/{entryId} {
      allow read: if request.auth != null &&
        (resource.data.athleteId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'coach' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null &&
        request.resource.data.athleteId == request.auth.uid;
      allow update, delete: if request.auth != null &&
        resource.data.athleteId == request.auth.uid;
    }

    match /competitions/{competitionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (resource.data.athleteId == request.auth.uid ||
         resource.data.coachId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /metadata/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Dodaj reguły bezpieczeństwa Storage:

W **Storage** > **Rules**, wklej:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /trainings/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (request.resource.size < 50 * 1024 * 1024 &&
         request.resource.contentType.matches('image/.*|video/.*'));
    }
  }
}
```

### 3. Konfiguracja zmiennych środowiskowych

1. Skopiuj plik `.env.example` do `.env`:

```bash
cp .env.example .env
```

2. Wypełnij plik `.env` danymi z Firebase Config:

```env
VITE_FIREBASE_API_KEY=twoj_api_key
VITE_FIREBASE_AUTH_DOMAIN=twoj_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=twoj_project_id
VITE_FIREBASE_STORAGE_BUCKET=twoj_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=twoj_sender_id
VITE_FIREBASE_APP_ID=twoj_app_id
```

## Uruchomienie

### Tryb deweloperski

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5173`

### Build produkcyjny

```bash
npm run build
```

### Preview buildu

```bash
npm run preview
```

## Pierwsze uruchomienie

1. **Pierwsze logowanie** - osoba, która zaloguje się jako pierwsza, automatycznie otrzyma rolę **administratora**
2. **Administrator** może następnie:
   - Przypisywać role innym użytkownikom (zawodnik/trener/admin)
   - Przypisywać zawodników do trenerów
3. **Trenerzy** mogą tworzyć treningi dla swoich zawodników
4. **Zawodnicy** widzą treningi od swojego trenera i mogą dodawać feedback

## Struktura bazy danych Firestore

### Kolekcja `users`
```javascript
{
  email: string,
  displayName: string,
  photoURL: string,
  role: 'admin' | 'coach' | 'athlete' | null,
  coachId: string | null,  // ID trenera (tylko dla zawodników)
  createdAt: string
}
```

### Kolekcja `trainings`
```javascript
{
  title: string,
  description: string,
  coachId: string,
  coachName: string,
  duration: number,  // w minutach
  difficulty: 'easy' | 'medium' | 'hard',
  exercises: [{
    name: string,      // np. "Kraul - sprint"
    sets: string,      // np. "4x"
    reps: string,      // dystans, np. "100m"
    distance: string,  // tempo, np. "80%"
    rest: string       // np. "30s"
  }],
  mediaUrls: string[],  // URLs do Firebase Storage
  createdAt: string,
  updatedAt: string
}
```

### Kolekcja `feedback`
```javascript
{
  trainingId: string,
  athleteId: string,
  athleteName: string,
  text: string,
  response: string | null,  // odpowiedź trenera
  createdAt: string,
  respondedAt: string | null
}
```

### Kolekcja `messages`
```javascript
{
  senderId: string,
  senderName: string,
  receiverId: string,
  text: string,
  createdAt: string,
  read: boolean
}
```

### Kolekcja `scheduledTrainings`
```javascript
{
  trainingId: string,
  coachId: string,
  athleteId: string | null,
  scheduledDate: string,  // ISO timestamp
  completed: boolean,
  createdAt: string
}
```

### Kolekcja `trainingDiaryEntries`
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

### Kolekcja `competitions`
```javascript
{
  name: string,
  date: string,  // YYYY-MM-DD
  location: string,
  events: [{
    event: string,       // np. "100m kraul"
    targetTime: string,  // cel czasowy
    actualTime: string,  // rzeczywisty wynik
    notes: string
  }],
  athleteId: string | null,
  coachId: string | null,
  createdAt: string,
  updatedAt: string
}
```

## Wsparcie

W przypadku problemów lub pytań, sprawdź:
- [Dokumentacja Firebase](https://firebase.google.com/docs)
- [Dokumentacja React](https://react.dev)
- [Dokumentacja Vite](https://vitejs.dev)

## Licencja

ISC
