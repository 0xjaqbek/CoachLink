import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import '../styles/GuidePanel.css'

const GuidePanel = () => {
  const { currentUser, userRole } = useAuth()
  const [activeGuideTab, setActiveGuideTab] = useState(userRole === 'coach' ? 'coach' : 'athlete')

  return (
    <>
      <Navigation />
      <div className="container">
        <div className="guide-header">
          <h1>📖 Przewodnik użytkownika CoachLink</h1>
          <p>Szczegółowe instrukcje jak korzystać z aplikacji</p>
        </div>

        <div className="guide-tabs">
          <button
            className={`guide-tab ${activeGuideTab === 'coach' ? 'active' : ''}`}
            onClick={() => setActiveGuideTab('coach')}
          >
            👨‍🏫 Przewodnik dla Trenera
          </button>
          <button
            className={`guide-tab ${activeGuideTab === 'athlete' ? 'active' : ''}`}
            onClick={() => setActiveGuideTab('athlete')}
          >
            🏊 Przewodnik dla Zawodnika
          </button>
        </div>

        {activeGuideTab === 'coach' && (
          <div className="guide-content">
            <section className="guide-section">
              <h2>🎯 1. Tworzenie treningów</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Przejdź do zakładki "Treningi"</h3>
                    <p>Kliknij na zakładkę "Treningi" w górnym menu.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Kliknij "+ Dodaj Trening"</h3>
                    <p>Znajdziesz ten przycisk w prawym górnym rogu sekcji.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>Wypełnij formularz treningu</h3>
                    <ul>
                      <li><strong>Tytuł:</strong> Nazwa treningu (np. "Trening wytrzymałościowy - kraul")</li>
                      <li><strong>Opis:</strong> Dodatkowe informacje o treningu</li>
                      <li><strong>Czas trwania:</strong> Przewidziany czas w minutach</li>
                      <li><strong>Poziom trudności:</strong> Łatwy / Średni / Trudny</li>
                      <li><strong>Kategoria:</strong> Wytrzymałość, Technika, Sprint, Siła, Regeneracja lub Mieszany</li>
                    </ul>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h3>Dodaj ćwiczenia</h3>
                    <p>Dla każdego ćwiczenia wypełnij:</p>
                    <ul>
                      <li><strong>Nazwa:</strong> np. "Kraul - sprint", "Grzbiet - technika"</li>
                      <li><strong>Serie:</strong> np. "4x", "8x"</li>
                      <li><strong>Dystans:</strong> np. "100m", "200m"</li>
                      <li><strong>Tempo:</strong> np. "80%", "aerobowe", "maksymalne"</li>
                      <li><strong>Odpoczynek:</strong> np. "30s", "1min"</li>
                    </ul>
                    <p className="tip">💡 Kliknij "+ Dodaj ćwiczenie" aby dodać więcej ćwiczeń</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">5</span>
                  <div className="step-content">
                    <h3>Dodaj multimedia (opcjonalnie)</h3>
                    <p>Możesz przesłać zdjęcia lub filmy instruktażowe pokazujące jak wykonać ćwiczenie.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">6</span>
                  <div className="step-content">
                    <h3>Zapisz trening</h3>
                    <p>Kliknij "Utwórz trening" - trening pojawi się na Twojej liście.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>📋 2. Tworzenie szablonów treningów</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Utwórz trening jak zwykle</h3>
                    <p>Postępuj zgodnie z instrukcją powyżej.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Zaznacz "Zapisz jako szablon"</h3>
                    <p>Przed kliknięciem "Utwórz trening", zaznacz checkbox "Zapisz jako szablon (będzie dostępny do ponownego użycia)"</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>Szablon jest gotowy!</h3>
                    <p>Szablon pojawi się na liście treningów z oznaczeniem "Szablon". Możesz go przypisywać wielu zawodnikom bez tworzenia za każdym razem od nowa.</p>
                    <p className="tip">💡 Filtruj treningi wybierając "Tylko szablony" aby zobaczyć wszystkie swoje szablony</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>📅 3. Przypisywanie treningów zawodnikom</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Przejdź do zakładki "Zawodnicy"</h3>
                    <p>Zobaczysz listę wszystkich zawodników przypisanych do Ciebie.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Kliknij w wybranego zawodnika</h3>
                    <p>Kliknij w kartę zawodnika aby otworzyć jego szczegóły.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>Otwórz zakładkę "Kalendarz"</h3>
                    <p>Zobaczysz indywidualny kalendarz tygodniowy tego zawodnika.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h3>Wybierz trening z listy</h3>
                    <p>Z rozwijanej listy wybierz trening (możesz wybrać zwykły trening lub szablon).</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">5</span>
                  <div className="step-content">
                    <h3>Kliknij na dzień w kalendarzu</h3>
                    <p>Kliknij na dzień, w którym zawodnik ma wykonać ten trening. Trening pojawi się w kalendarzu.</p>
                    <p className="tip">💡 Nawiguj między tygodniami używając przycisków "← Poprzedni tydzień" i "Następny tydzień →"</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>📊 4. Monitorowanie postępów zawodnika</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Kliknij w zawodnika w zakładce "Zawodnicy"</h3>
                    <p>Otworzą się szczegóły zawodnika z 4 zakładkami.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Zakładka "Statystyki"</h3>
                    <p>Zobacz kompleksowe statystyki:</p>
                    <ul>
                      <li>Liczba wszystkich treningów / wykonanych / opuszczonych</li>
                      <li>Procent wykonalności</li>
                      <li>Średnie samopoczucie zawodnika (skala 1-5)</li>
                      <li>Średni czas snu</li>
                    </ul>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>Zakładka "Dziennik"</h3>
                    <p>Przeczytaj wpisy zawodnika z treningów:</p>
                    <ul>
                      <li>Data wykonania treningu</li>
                      <li>Ocena samopoczucia (1-5)</li>
                      <li>Godziny snu</li>
                      <li>Notatki po treningu</li>
                      <li>Status (wykonany/opuszczony)</li>
                    </ul>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h3>Zakładka "Zawody"</h3>
                    <p>Zobacz zaplanowane i przeszłe zawody zawodnika:</p>
                    <ul>
                      <li>Nadchodzące zawody</li>
                      <li>Cele czasowe w poszczególnych konkurencjach</li>
                      <li>Rzeczywiste wyniki</li>
                      <li>Notatki do startów</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>💬 5. Komunikacja z zawodnikami</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Feedback od zawodników</h3>
                    <p>Przejdź do zakładki "Feedback" aby zobaczyć wszystkie opinie zawodników na temat treningów.</p>
                    <p>Możesz odpowiadać na feedback klikając "Odpowiedz".</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Wiadomości</h3>
                    <p>Przejdź do zakładki "Wiadomości":</p>
                    <ul>
                      <li>Wybierz zawodnika z listy po lewej stronie</li>
                      <li>Pisz wiadomości w czasie rzeczywistym</li>
                      <li>Czat działa jak messenger - zawodnik natychmiast zobaczy Twoją wiadomość</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>🔍 6. Filtrowanie i organizacja</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Filtrowanie treningów według typu</h3>
                    <p>W zakładce "Treningi" użyj filtru "Typ":</p>
                    <ul>
                      <li><strong>Wszystkie:</strong> Pokaż wszystkie treningi i szablony</li>
                      <li><strong>Tylko treningi:</strong> Ukryj szablony</li>
                      <li><strong>Tylko szablony:</strong> Pokaż tylko szablony</li>
                    </ul>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Filtrowanie według kategorii</h3>
                    <p>Użyj filtru "Kategoria" aby znaleźć treningi:</p>
                    <ul>
                      <li>Wytrzymałość</li>
                      <li>Technika</li>
                      <li>Sprint</li>
                      <li>Siła</li>
                      <li>Regeneracja</li>
                      <li>Mieszany</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeGuideTab === 'athlete' && (
          <div className="guide-content">
            <section className="guide-section">
              <h2>📅 1. Przeglądanie kalendarza treningów</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Przejdź do zakładki "Kalendarz"</h3>
                    <p>Zobaczysz swój tygodniowy plan treningowy.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Sprawdź treningi na dany dzień</h3>
                    <ul>
                      <li>Dzisiejszy dzień jest <strong>podświetlony</strong></li>
                      <li>Kliknij "Pokaż szczegóły" przy treningu aby zobaczyć pełny plan</li>
                      <li>Nawiguj między tygodniami używając strzałek</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>🏋️ 2. Przeglądanie szczegółów treningu</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Przejdź do zakładki "Treningi"</h3>
                    <p>Zobaczysz wszystkie treningi przypisane przez trenera.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Kliknij "Pokaż szczegóły"</h3>
                    <p>Zobaczysz:</p>
                    <ul>
                      <li><strong>Ćwiczenia:</strong> Lista wszystkich ćwiczeń z parametrami (serie, dystans, tempo, odpoczynek)</li>
                      <li><strong>Multimedia:</strong> Zdjęcia i filmy instruktażowe od trenera</li>
                      <li><strong>Informacje:</strong> Czas trwania, poziom trudności, kategoria</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>📝 3. Wypełnianie dziennika treningowego</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Po wykonaniu treningu przejdź do "Dziennik"</h3>
                    <p>Dziennik pomoże Ci i trenerowi monitorować postępy.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Kliknij "+ Dodaj wpis"</h3>
                    <p>Otwórz formularz dodawania wpisu.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>Wypełnij formularz</h3>
                    <ul>
                      <li><strong>Wybierz trening:</strong> Z listy zaplanowanych treningów</li>
                      <li><strong>Status:</strong> Wykonany lub Opuszczony</li>
                      <li><strong>Samopoczucie:</strong> Oceń w skali 1-5 (1 = bardzo źle, 5 = świetnie)</li>
                      <li><strong>Sen:</strong> Ile godzin spałeś poprzedniej nocy</li>
                      <li><strong>Notatki:</strong> Twoje obserwacje, jak się czułeś, co poszło dobrze/źle</li>
                    </ul>
                    <p className="tip">💡 Bądź szczery w ocenach - to pomoże trenerowi dostosować plan do Twoich możliwości!</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h3>Zapisz wpis</h3>
                    <p>Kliknij "Dodaj wpis" - wpis pojawi się w Twoim dzienniku i trener będzie mógł go zobaczyć.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>💬 4. Dodawanie feedbacku do treningu</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Znajdź trening w zakładce "Treningi"</h3>
                    <p>Kliknij "Pokaż szczegóły" przy wybranym treningu.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Kliknij "Dodaj feedback"</h3>
                    <p>Pojawi się pole tekstowe.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>Napisz swoją opinię</h3>
                    <p>Przykłady feedbacku:</p>
                    <ul>
                      <li>"Trening był bardzo intensywny, ale dałem radę. Czuję postęp w wytrzymałości."</li>
                      <li>"Dystans był za długi, nie udało mi się utrzymać tempa w ostatnich seriach."</li>
                      <li>"Świetny trening techniczny, czuję poprawę w koordynacji ruchów."</li>
                      <li>"Potrzebuję więcej odpoczynku między seriami."</li>
                    </ul>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h3>Wyślij feedback</h3>
                    <p>Kliknij "Wyślij" - trener zobaczy Twoją opinię i może na nią odpowiedzieć.</p>
                    <p className="tip">💡 Jeśli trener odpowie na Twój feedback, zobaczysz jego odpowiedź pod Twoją opinią</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>📊 5. Monitorowanie własnych statystyk</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Przejdź do zakładki "Statystyki"</h3>
                    <p>Zobacz swoje postępy treningowe.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Sprawdź swoje wskaźniki</h3>
                    <ul>
                      <li><strong>Wykonalność:</strong> % treningów, które udało Ci się wykonać</li>
                      <li><strong>Średnie samopoczucie:</strong> Średnia z Twoich ocen samopoczucia</li>
                      <li><strong>Średni sen:</strong> Ile średnio śpisz</li>
                      <li><strong>Wykres aktywności:</strong> Wizualizacja Twojej aktywności treningowej</li>
                    </ul>
                    <p className="tip">💡 Przełączaj między widokiem tygodnia a miesiąca aby zobaczyć długoterminowe trendy</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>Analizuj swoje postępy</h3>
                    <p>Regularne wypełnianie dziennika pozwoli Ci i trenerowi zobaczyć:</p>
                    <ul>
                      <li>Jak zmieniają się Twoje wyniki</li>
                      <li>Czy jesteś wypoczęty</li>
                      <li>Czy plan treningowy jest dopasowany do Twoich możliwości</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>🏊 6. Planowanie zawodów i startów</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Przejdź do zakładki "Zawody"</h3>
                    <p>Tutaj zarządzasz swoimi startami.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Kliknij "+ Dodaj zawody"</h3>
                    <p>Otwórz formularz dodawania zawodów.</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>Wypełnij podstawowe informacje</h3>
                    <ul>
                      <li><strong>Nazwa:</strong> np. "Mistrzostwa Polski Juniorów"</li>
                      <li><strong>Data:</strong> Kiedy odbędą się zawody</li>
                      <li><strong>Miejsce:</strong> np. "Warszawa - OSiR Bemowo"</li>
                    </ul>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h3>Dodaj konkurencje (starty)</h3>
                    <p>Dla każdej konkurencji podaj:</p>
                    <ul>
                      <li><strong>Konkurencja:</strong> np. "100m kraul", "200m motyl"</li>
                      <li><strong>Cel czasowy:</strong> Jaki wynik chcesz osiągnąć (np. "55.00")</li>
                    </ul>
                    <p className="tip">💡 Kliknij "+ Dodaj konkurencję" aby dodać więcej startów</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">5</span>
                  <div className="step-content">
                    <h3>Po zawodach - dodaj wyniki</h3>
                    <ul>
                      <li>Kliknij "Edytuj" przy zawodach</li>
                      <li>Wypełnij "Wynik" dla każdej konkurencji (np. "54.32")</li>
                      <li>Dodaj notatki (np. "Nowy rekord życiowy!", "Słaba reakcja na start")</li>
                      <li>Zapisz zmiany</li>
                    </ul>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">6</span>
                  <div className="step-content">
                    <h3>Przeglądaj historię</h3>
                    <p>Zawody są podzielone na:</p>
                    <ul>
                      <li><strong>Nadchodzące:</strong> Zawody w przyszłości</li>
                      <li><strong>Historia:</strong> Przeszłe zawody z wynikami</li>
                    </ul>
                    <p className="tip">💡 Twój trener widzi Twoje zawody i może pomóc w przygotowaniach!</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>💬 7. Komunikacja z trenerem</h2>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Wiadomości w czasie rzeczywistym</h3>
                    <p>Przejdź do zakładki "Wiadomości":</p>
                    <ul>
                      <li>Pisz wiadomości bezpośrednio do trenera</li>
                      <li>Zadawaj pytania o treningi</li>
                      <li>Informuj o kontuzjach lub złym samopoczuciu</li>
                      <li>Czat działa w czasie rzeczywistym!</li>
                    </ul>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Feedback do treningów</h3>
                    <p>Po każdym treningu dodaj krótki feedback - trener będzie wiedział:</p>
                    <ul>
                      <li>Jak się czułeś podczas treningu</li>
                      <li>Co było trudne</li>
                      <li>Co wymaga poprawy</li>
                      <li>Czy plan jest odpowiedni</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>✅ 8. Najlepsze praktyki</h2>
              <div className="guide-tips">
                <div className="tip-card">
                  <h3>📅 Regularność</h3>
                  <p>Sprawdzaj kalendarz codziennie rano, żeby wiedzieć co Cię czeka.</p>
                </div>
                <div className="tip-card">
                  <h3>📝 Dziennik</h3>
                  <p>Wypełniaj dziennik zaraz po treningu, póki świeże wrażenia!</p>
                </div>
                <div className="tip-card">
                  <h3>💬 Komunikacja</h3>
                  <p>Nie bój się pisać do trenera - jeśli coś boli, czujesz się zmęczony lub masz pytania.</p>
                </div>
                <div className="tip-card">
                  <h3>🎯 Cele</h3>
                  <p>Ustawiaj realistyczne cele czasowe w zawodach - lepiej je osiągnąć niż rozczarować się!</p>
                </div>
                <div className="tip-card">
                  <h3>😴 Sen</h3>
                  <p>Śledź swój sen w dzienniku - to bardzo ważny wskaźnik regeneracji!</p>
                </div>
                <div className="tip-card">
                  <h3>📊 Statystyki</h3>
                  <p>Regularnie sprawdzaj statystyki - motywują i pokazują postępy!</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  )
}

export default GuidePanel
