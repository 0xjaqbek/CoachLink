# Przewodnik Konfiguracji CoachLink

Ten przewodnik przeprowadzi Cię krok po kroku przez proces konfiguracji aplikacji CoachLink.

## Krok 1: Przygotowanie środowiska

### Wymagania:
- Node.js (wersja 16 lub nowsza) - [Pobierz tutaj](https://nodejs.org/)
- Konto Google (do Firebase i logowania)
- Edytor kodu (np. VS Code)

### Sprawdź instalację Node.js:

```bash
node --version
npm --version
```

## Krok 2: Instalacja projektu

1. Otwórz terminal w folderze projektu
2. Zainstaluj zależności:

```bash
npm install
```

## Krok 3: Konfiguracja Firebase

### 3.1 Utwórz projekt Firebase

1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Kliknij **"Dodaj projekt"** (Add project)
3. Wpisz nazwę projektu: `coachlink` (lub dowolną inną)
4. Wyłącz Google Analytics (opcjonalnie) lub zostaw włączone
5. Kliknij **"Utwórz projekt"**
6. Poczekaj na utworzenie projektu (~30 sekund)
7. Kliknij **"Kontynuuj"**

### 3.2 Włącz autentykację Google

1. W menu bocznym kliknij **"Authentication"**
2. Kliknij **"Get started"** (jeśli to pierwszy raz)
3. Przejdź do zakładki **"Sign-in method"**
4. Kliknij na **"Google"** na liście dostawców
5. Włącz przełącznik **"Enable"**
6. Wybierz email wsparcia projektu (Twój email)
7. Kliknij **"Zapisz"** (Save)

### 3.3 Utwórz bazę Firestore

1. W menu bocznym kliknij **"Firestore Database"**
2. Kliknij **"Create database"**
3. Wybierz lokalizację: **europe-west** (lub najbliższą Tobie)
4. Wybierz **"Start in test mode"** (na początek)
5. Kliknij **"Enable"**
6. Poczekaj na utworzenie bazy (~1 minuta)

### 3.4 Skonfiguruj Firebase Storage

1. W menu bocznym kliknij **"Storage"**
2. Kliknij **"Get started"**
3. Kliknij **"Next"** (zostaw domyślne reguły test mode)
4. Wybierz tę samą lokalizację co dla Firestore
5. Kliknij **"Done"**

### 3.5 Dodaj aplikację webową

1. Na stronie głównej projektu, w sekcji "Get started by adding Firebase to your app"
2. Kliknij ikonę web **`</>`**
3. Wpisz nazwę aplikacji: `CoachLink Web`
4. **NIE** zaznaczaj "Also set up Firebase Hosting"
5. Kliknij **"Register app"**

### 3.6 Skopiuj konfigurację Firebase

Po zarejestrowaniu aplikacji zobaczysz kod podobny do:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "coachlink-xyz.firebaseapp.com",
  projectId: "coachlink-xyz",
  storageBucket: "coachlink-xyz.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**WAŻNE**: Skopiuj te wartości - będą potrzebne w następnym kroku!

## Krok 4: Konfiguracja zmiennych środowiskowych

1. W folderze projektu znajdź plik `.env.example`
2. Utwórz nowy plik o nazwie `.env` (bez żadnego rozszerzenia)
3. Skopiuj zawartość z `.env.example` do `.env`
4. Wypełnij wartości danymi z Firebase Config:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=coachlink-xyz.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=coachlink-xyz
VITE_FIREBASE_STORAGE_BUCKET=coachlink-xyz.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

5. Zapisz plik `.env`

## Krok 5: Dodaj reguły bezpieczeństwa

### 5.1 Reguły Firestore

1. W Firebase Console, przejdź do **Firestore Database**
2. Kliknij zakładkę **"Rules"**
3. Usuń obecny kod i wklej:

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

4. Kliknij **"Publish"** (Opublikuj)

### 5.2 Reguły Storage

1. W Firebase Console, przejdź do **Storage**
2. Kliknij zakładkę **"Rules"**
3. Usuń obecny kod i wklej:

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

4. Kliknij **"Publish"** (Opublikuj)

## Krok 6: Uruchomienie aplikacji

1. Otwórz terminal w folderze projektu
2. Uruchom aplikację:

```bash
npm run dev
```

3. Poczekaj na komunikat podobny do:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

4. Otwórz przeglądarkę i przejdź do: **http://localhost:5173**

## Krok 7: Pierwsze logowanie

1. Na stronie logowania kliknij **"Zaloguj się przez Google"**
2. Wybierz konto Google
3. Zezwól aplikacji na dostęp
4. **Pierwsze konto automatycznie otrzyma rolę administratora!**

## Krok 8: Konfiguracja użytkowników

Jako administrator możesz teraz:

1. Zaloguj się na inne konta Google (otwórz aplikację w trybie incognito)
2. Te konta będą miały rolę "null" (brak przypisanej roli)
3. Wróć do konta administratora
4. Przejdź do zakładki **"Użytkownicy"**
5. Przypisz role użytkownikom:
   - **Zawodnik** (athlete) - dostęp do treningów
   - **Trener** (coach) - tworzenie treningów
   - **Administrator** (admin) - pełna kontrola

## Krok 9: Przypisz zawodników do trenerów

1. W panelu administratora przejdź do **"Przypisania"**
2. Dla każdego zawodnika wybierz trenera z listy rozwijanej
3. Zmiany zapisują się automatycznie

## Krok 10: Testowanie funkcjonalności

### Jako trener:
1. Przejdź do zakładki **"Treningi"**
2. Kliknij **"+ Dodaj Trening"**
3. Wypełnij formularz:
   - Tytuł
   - Opis
   - Dodaj ćwiczenia
   - Opcjonalnie dodaj zdjęcia/filmy
4. Kliknij **"Utwórz trening"**

### Jako zawodnik:
1. Zobacz treningi od swojego trenera
2. Kliknij **"Pokaż szczegóły"** aby zobaczyć plan
3. Kliknij **"Dodaj feedback"**
4. Napisz opinię o treningu

### Jako trener (odpowiedź na feedback):
1. Przejdź do zakładki **"Feedback"**
2. Zobacz opinie zawodników
3. Kliknij **"Odpowiedz"**
4. Napisz odpowiedź

## Rozwiązywanie problemów

### Błąd: "Firebase: Error (auth/...)"
- Sprawdź czy włączyłeś Google Authentication w Firebase Console
- Sprawdź czy plik `.env` jest poprawnie skonfigurowany

### Błąd: "Missing or insufficient permissions"
- Sprawdź czy dodałeś reguły bezpieczeństwa w Firestore i Storage
- Sprawdź czy jesteś zalogowany

### Aplikacja się nie uruchamia
- Sprawdź czy zainstalowałeś zależności: `npm install`
- Sprawdź czy plik `.env` istnieje i jest poprawnie wypełniony
- Sprawdź czy używasz Node.js w wersji 16 lub nowszej

### Nie mogę przesłać zdjęć/filmów
- Sprawdź czy włączyłeś Firebase Storage
- Sprawdź czy dodałeś reguły Security Rules dla Storage
- Sprawdź rozmiar pliku (max 50MB)

## Pomoc

Jeśli masz problemy:
1. Sprawdź konsolę przeglądarki (F12 > Console)
2. Sprawdź terminal gdzie uruchomiłeś `npm run dev`
3. Przeczytaj dokumentację Firebase: https://firebase.google.com/docs
