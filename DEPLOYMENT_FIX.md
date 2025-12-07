# 🔧 Naprawa błędu deployment - Invalid API Key

## Problem
Aplikacja na https://coachlink26.web.app/login pokazuje błąd:
```
Firebase: Error (auth/invalid-api-key)
```

## Przyczyna
Zmienne środowiskowe z pliku `.env` nie zostały wbudowane w build produkcyjny podczas deployment.

---

## ✅ Rozwiązanie - Krok po kroku

### 1. Upewnij się, że plik `.env` istnieje i jest poprawny

Sprawdź czy plik `.env` w głównym folderze projektu zawiera:

```env
VITE_FIREBASE_API_KEY=AIzaSyAPAUzl21LdkDKS5jvjw8Ds2XkFKot7O1s
VITE_FIREBASE_AUTH_DOMAIN=coachlink26.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=coachlink26
VITE_FIREBASE_STORAGE_BUCKET=coachlink26.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=106710325924
VITE_FIREBASE_APP_ID=1:106710325924:web:694ff9d045f9b13057e431
```

✅ **Plik .env jest poprawny i znajduje się w głównym folderze projektu**

---

### 2. Wyczyść stary build

Usuń folder `dist` aby upewnić się, że build będzie świeży:

**Windows (PowerShell/CMD):**
```bash
rmdir /s /q dist
```

**Linux/Mac:**
```bash
rm -rf dist
```

**Lub ręcznie:**
Usuń folder `dist` w folderze projektu

---

### 3. Przebuduj aplikację

Uruchom build z załadowanymi zmiennymi środowiskowymi:

```bash
npm run build
```

**WAŻNE:** Vite automatycznie wczyta zmienne z pliku `.env` podczas buildu i wbuduje je w kod JavaScript.

Poczekaj aż build się zakończy. Powinieneś zobaczyć komunikat:
```
✓ built in [czas]
```

---

### 4. Sprawdź czy build zawiera zmienne (opcjonalnie)

Możesz sprawdzić czy zmienne zostały wbudowane:

```bash
type dist\assets\index-*.js | findstr "coachlink26"
```

Jeśli zobaczysz `coachlink26.firebaseapp.com` - zmienne są wbudowane ✅

---

### 5. Wdróż ponownie na Firebase Hosting

```bash
firebase deploy --only hosting
```

Poczekaj na zakończenie deployment (~30-60 sekund).

Zobaczysz komunikat:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/coachlink26/overview
Hosting URL: https://coachlink26.web.app
```

---

### 6. Wyczyść cache przeglądarki i odśwież

**Ważne!** Stara wersja może być w cache przeglądarki.

**Metoda 1: Hard refresh**
- Chrome/Edge: `Ctrl + Shift + R` (Windows) lub `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5`

**Metoda 2: Wyczyść cache**
1. `Ctrl + Shift + Delete`
2. Zaznacz "Cached images and files"
3. Kliknij "Clear data"

**Metoda 3: Tryb incognito**
Otwórz https://coachlink26.web.app w nowym oknie incognito

---

### 7. Sprawdź czy działa

1. Otwórz https://coachlink26.web.app
2. Powinieneś zobaczyć stronę logowania **bez błędu**
3. Kliknij "Zaloguj się przez Google"
4. Zaloguj się swoim kontem Google

✅ **Jeśli wszystko działa - gotowe!**

---

## 🔍 Weryfikacja deployment

### Sprawdź w konsoli przeglądarki (F12)

Nie powinno być błędów typu:
- ❌ "auth/invalid-api-key"
- ❌ "Firebase: Error"

Jeśli nadal widzisz błędy:

1. **Upewnij się, że wykonałeś wszystkie kroki powyżej**
2. **Sprawdź czy plik .env ma wszystkie zmienne (6 linii)**
3. **Zrób build ponownie**: `npm run build`
4. **Deploy ponownie**: `firebase deploy --only hosting`
5. **Wyczyść cache przeglądarki (hard refresh)**

---

## 📝 Dlaczego to się stało?

Vite (build tool używany w projekcie) wymaga aby zmienne środowiskowe:
1. **Były w pliku `.env` w głównym folderze projektu**
2. **Były prefixowane `VITE_`** (już są ✅)
3. **Były dostępne podczas `npm run build`**

Jeśli ktoś zrobił `firebase deploy` bez wcześniejszego `npm run build`, albo build był zrobiony bez pliku `.env`, zmienne nie zostały wbudowane.

---

## ⚠️ Uwagi bezpieczeństwa

**API Key w .env jest bezpieczny do commitowania:**
- Firebase API Keys są publiczne i przeznaczone do użycia w przeglądarkach
- Rzeczywiste zabezpieczenie jest w Firebase Security Rules
- **NIE commituj** pliku `.env` z innymi secretami (np. service account keys)

Jednak zalecamy:
- Dodać `.env` do `.gitignore` (już jest ✅)
- Używać `.env.example` jako template

---

## 🆘 Dalsze problemy?

Jeśli nadal widzisz błędy:

1. Sprawdź Firebase Console czy projekt jest aktywny:
   https://console.firebase.google.com/project/coachlink26/overview

2. Sprawdź czy Authentication jest włączone:
   https://console.firebase.google.com/project/coachlink26/authentication

3. Sprawdź czy Google Sign-In jest włączony w Authentication

4. Sprawdź logi deployment:
   ```bash
   firebase hosting:channel:list
   ```

---

## ✅ Checklist naprawy

- [ ] Plik `.env` istnieje w głównym folderze
- [ ] Plik `.env` zawiera wszystkie 6 zmiennych VITE_FIREBASE_*
- [ ] Usunięto folder `dist`
- [ ] Wykonano `npm run build`
- [ ] Build zakończył się sukcesem
- [ ] Wykonano `firebase deploy --only hosting`
- [ ] Deploy zakończył się sukcesem
- [ ] Wyczyszczono cache przeglądarki (Ctrl+Shift+R)
- [ ] Strona https://coachlink26.web.app działa bez błędów

Jeśli wszystko zaznaczone ✅ - aplikacja powinna działać!
