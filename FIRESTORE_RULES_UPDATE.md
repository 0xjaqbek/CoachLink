# 🔧 Aktualizacja Reguł Firestore

## Problem
Otrzymujesz błąd: **"Missing or insufficient permissions"** podczas:
- Przeglądania kalendarza zawodników
- Dodawania treningów do kalendarza zawodnika
- Przeglądania statystyk, dziennika lub zawodów zawodnika

## Rozwiązanie

Musisz zaktualizować reguły bezpieczeństwa Firestore w Firebase Console.

---

## Krok po kroku:

### 1. Otwórz Firebase Console
1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Wybierz swój projekt

### 2. Przejdź do Firestore Database Rules
1. W menu po lewej stronie kliknij **"Firestore Database"**
2. Kliknij zakładkę **"Rules"** (na górze)

### 3. Zastąp stare reguły nowymi
1. **Zaznacz cały obecny kod** w edytorze (Ctrl+A / Cmd+A)
2. **Usuń** stary kod (Delete)
3. **Skopiuj** poniższy kod i **wklej** do edytora:

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
      allow read: if request.auth != null &&
        (resource.data.athleteId == request.auth.uid ||
         resource.data.coachId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null &&
        (request.resource.data.coachId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update, delete: if request.auth != null &&
        (resource.data.coachId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /trainingDiaryEntries/{entryId} {
      allow read: if request.auth != null &&
        (resource.data.athleteId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(resource.data.athleteId)).data.coachId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null &&
        request.resource.data.athleteId == request.auth.uid;
      allow update, delete: if request.auth != null &&
        resource.data.athleteId == request.auth.uid;
    }

    match /competitions/{competitionId} {
      allow read: if request.auth != null &&
        (resource.data.athleteId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(resource.data.athleteId)).data.coachId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
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

### 4. Opublikuj nowe reguły
1. Kliknij przycisk **"Publish"** (Opublikuj) w prawym górnym rogu
2. Poczekaj na komunikat potwierdzający

### 5. Odśwież aplikację
1. Wróć do aplikacji CoachLink
2. **Odśwież stronę** (F5 lub Ctrl+R)
3. Spróbuj ponownie kliknąć w zawodnika i dodać trening

---

## Co zostało zmienione?

### scheduledTrainings
**Przed:** Każdy trener mógł czytać wszystkie zaplanowane treningi
**Po:** Trener może czytać tylko treningi swoich zawodników (sprawdzane przez `coachId`)

### trainingDiaryEntries
**Przed:** Każdy trener mógł czytać wszystkie wpisy dziennika
**Po:** Trener może czytać tylko wpisy swoich zawodników (sprawdzane przez `coachId` zawodnika)

### competitions
**Przed:** Każdy użytkownik mógł czytać wszystkie zawody
**Po:** Trener może czytać tylko zawody swoich zawodników (sprawdzane przez `coachId` zawodnika)

---

## Weryfikacja

Po zaktualizowaniu reguł sprawdź czy:
- ✅ Możesz kliknąć w zawodnika w zakładce "Zawodnicy"
- ✅ Widzisz jego kalendarz, statystyki, dziennik i zawody
- ✅ Możesz dodać trening do kalendarza zawodnika
- ✅ Nie ma błędów "Missing or insufficient permissions" w konsoli przeglądarki

---

## Pomoc

Jeśli nadal masz problemy:
1. Sprawdź konsolę przeglądarki (F12 → Console)
2. Upewnij się, że jesteś zalogowany jako trener
3. Upewnij się, że zawodnik jest przypisany do Ciebie (sprawdź w panelu administratora)
4. Spróbuj wylogować się i zalogować ponownie
