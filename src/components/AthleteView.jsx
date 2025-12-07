import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import WeeklyCalendar from './WeeklyCalendar'
import '../styles/AthleteView.css'

const AthleteView = ({ athletes, coachId, trainings, onRefresh, preselectedAthleteId }) => {
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [athleteStats, setAthleteStats] = useState(null)
  const [athleteDiary, setAthleteDiary] = useState([])
  const [athleteCompetitions, setAthleteCompetitions] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('calendar')
  const [expandedEntries, setExpandedEntries] = useState({})

  useEffect(() => {
    if (preselectedAthleteId && athletes.length > 0) {
      const athlete = athletes.find(a => a.id === preselectedAthleteId)
      if (athlete) {
        setSelectedAthlete(athlete)
      }
    }
  }, [preselectedAthleteId, athletes])

  useEffect(() => {
    if (selectedAthlete) {
      loadAthleteData()
    }
  }, [selectedAthlete])

  const loadAthleteData = async () => {
    if (!selectedAthlete) return

    setLoading(true)
    try {
      // Load diary entries
      const diaryQuery = query(
        collection(db, 'trainingDiaryEntries'),
        where('athleteId', '==', selectedAthlete.id),
        orderBy('createdAt', 'desc')
      )
      const diarySnapshot = await getDocs(diaryQuery)
      const diaryData = diarySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setAthleteDiary(diaryData)

      // Calculate stats from diary
      const completedEntries = diaryData.filter(entry =>
        (entry.completionStatus || (entry.completed ? 'completed' : 'skipped')) === 'completed'
      )
      const partialEntries = diaryData.filter(entry =>
        (entry.completionStatus || (entry.completed ? 'completed' : 'skipped')) === 'partial'
      )
      const missedEntries = diaryData.filter(entry =>
        (entry.completionStatus || (entry.completed ? 'completed' : 'skipped')) === 'skipped'
      )
      const totalEntries = diaryData.length

      // Calculate averages from completed and partial entries
      const entriesWithData = [...completedEntries, ...partialEntries]
      const avgFeeling = entriesWithData.length > 0
        ? entriesWithData.reduce((sum, entry) => sum + (entry.feeling || 0), 0) / entriesWithData.length
        : 0
      const avgSleep = entriesWithData.filter(e => e.sleepHours).length > 0
        ? entriesWithData.filter(e => e.sleepHours).reduce((sum, entry) => sum + (entry.sleepHours || 0), 0) / entriesWithData.filter(e => e.sleepHours).length
        : 0

      setAthleteStats({
        totalTrainings: totalEntries,
        completedTrainings: completedEntries.length,
        partialTrainings: partialEntries.length,
        missedTrainings: missedEntries.length,
        completionRate: totalEntries > 0 ? Math.round((completedEntries.length / totalEntries) * 100) : 0,
        avgFeeling: avgFeeling.toFixed(1),
        avgSleep: avgSleep.toFixed(1)
      })

      // Load competitions
      const competitionsQuery = query(
        collection(db, 'competitions'),
        where('athleteId', '==', selectedAthlete.id),
        orderBy('date', 'desc')
      )
      const competitionsSnapshot = await getDocs(competitionsQuery)
      const competitionsData = competitionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setAthleteCompetitions(competitionsData)

    } catch (error) {
      console.error('Error loading athlete data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEntryExpansion = (entryId) => {
    setExpandedEntries(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }))
  }

  const categoryLabels = {
    endurance: 'Wytrzymałość',
    technique: 'Technika',
    sprint: 'Sprint',
    strength: 'Siła',
    recovery: 'Regeneracja',
    mixed: 'Mieszany'
  }

  if (athletes.length === 0) {
    return (
      <div className="athlete-view">
        <div className="card">
          <p>Brak przypisanych zawodników.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="athlete-view">
      {!preselectedAthleteId && (
        <div className="athlete-selector">
          <label>Wybierz zawodnika:</label>
          <select
            value={selectedAthlete?.id || ''}
            onChange={(e) => {
              const athlete = athletes.find(a => a.id === e.target.value)
              setSelectedAthlete(athlete)
            }}
            className="input-field"
          >
            <option value="">-- Wybierz zawodnika --</option>
            {athletes.map(athlete => (
              <option key={athlete.id} value={athlete.id}>
                {athlete.displayName}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedAthlete && (
        <>
          <div className="athlete-info-card">
            {selectedAthlete.photoURL && (
              <img src={selectedAthlete.photoURL} alt={selectedAthlete.displayName} className="athlete-avatar-large" />
            )}
            <div>
              <h2>{selectedAthlete.displayName}</h2>
              <p>{selectedAthlete.email}</p>
            </div>
          </div>

          <div className="athlete-subtabs">
            <button
              className={`tab ${activeSubTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('calendar')}
            >
              Kalendarz
            </button>
            <button
              className={`tab ${activeSubTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('stats')}
            >
              Statystyki
            </button>
            <button
              className={`tab ${activeSubTab === 'diary' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('diary')}
            >
              Dziennik ({athleteDiary.length})
            </button>
            <button
              className={`tab ${activeSubTab === 'competitions' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('competitions')}
            >
              Zawody ({athleteCompetitions.length})
            </button>
          </div>

          {loading ? (
            <div className="loading">Ładowanie danych zawodnika...</div>
          ) : (
            <>
              {activeSubTab === 'calendar' && (
                <WeeklyCalendar
                  role="coach"
                  trainings={trainings}
                  onRefresh={onRefresh}
                  athleteId={selectedAthlete.id}
                />
              )}

              {activeSubTab === 'stats' && athleteStats && (
                <div className="athlete-stats">
                  <h3>Statystyki treningu</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{athleteStats.totalTrainings}</div>
                      <div className="stat-label">Wszystkich treningów</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value stat-completed">{athleteStats.completedTrainings}</div>
                      <div className="stat-label">Wykonanych w całości</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value stat-partial">{athleteStats.partialTrainings}</div>
                      <div className="stat-label">Częściowo wykonanych</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value stat-missed">{athleteStats.missedTrainings}</div>
                      <div className="stat-label">Opuszczonych</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{athleteStats.completionRate}%</div>
                      <div className="stat-label">Wykonalność</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{athleteStats.avgFeeling}</div>
                      <div className="stat-label">Średnie samopoczucie</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{athleteStats.avgSleep}h</div>
                      <div className="stat-label">Średni sen</div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'diary' && (
                <div className="athlete-diary-view">
                  <h3>Dziennik treningowy</h3>
                  {athleteDiary.length === 0 ? (
                    <div className="card">
                      <p>Zawodnik nie dodał jeszcze żadnych wpisów do dziennika.</p>
                    </div>
                  ) : (
                    <div className="diary-entries-list">
                      {athleteDiary.map(entry => {
                        const training = trainings.find(t => t.id === entry.trainingId)
                        const isExpanded = expandedEntries[entry.id]
                        return (
                          <div key={entry.id} className="diary-entry-card">
                            <div className="diary-entry-header">
                              <h4>{training?.title || 'Nieznany trening'}</h4>
                              <span className={`status-badge ${
                                (entry.completionStatus || (entry.completed ? 'completed' : 'missed')) === 'completed' ? 'completed' :
                                (entry.completionStatus || (entry.completed ? 'completed' : 'missed')) === 'partial' ? 'partial' :
                                'missed'
                              }`}>
                                {(entry.completionStatus || (entry.completed ? 'completed' : 'missed')) === 'completed' ? 'Wykonany' :
                                 (entry.completionStatus || (entry.completed ? 'completed' : 'missed')) === 'partial' ? 'Częściowo wykonany' :
                                 'Opuszczony'}
                              </span>
                            </div>
                            {training?.category && (
                              <p className="entry-category">Kategoria: {categoryLabels[training.category]}</p>
                            )}
                            <div className="diary-entry-details">
                              <div className="entry-info">
                                <strong>Data:</strong> {new Date(entry.createdAt).toLocaleDateString('pl-PL')}
                              </div>
                              {entry.completed && (
                                <>
                                  <div className="entry-info">
                                    <strong>Samopoczucie:</strong> {entry.feeling}/5
                                  </div>
                                  {entry.sleepHours && (
                                    <div className="entry-info">
                                      <strong>Sen:</strong> {entry.sleepHours}h
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            {entry.notes && (
                              <div className="entry-notes">
                                <strong>Notatki:</strong>
                                <p>{entry.notes}</p>
                              </div>
                            )}

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => toggleEntryExpansion(entry.id)}
                              style={{ marginTop: '15px' }}
                            >
                              {isExpanded ? 'Ukryj szczegóły treningu' : 'Zobacz szczegóły treningu'}
                            </button>

                            {isExpanded && training && (
                              <div className="training-details-section">
                                {training.description && (
                                  <div className="training-description">
                                    <strong>Opis:</strong>
                                    <p>{training.description}</p>
                                  </div>
                                )}

                                {training.duration && (
                                  <p className="training-duration">
                                    <strong>Czas trwania:</strong> {training.duration} min
                                  </p>
                                )}

                                {training.category && (
                                  <p className="training-category">
                                    <strong>Kategoria:</strong> {categoryLabels[training.category]}
                                  </p>
                                )}

                                {training.exercises && training.exercises.length > 0 && (
                                  <div className="exercises-list">
                                    <h4>Ćwiczenia:</h4>
                                    {training.exercises.map((exercise, index) => (
                                      <div key={index} className="exercise-item">
                                        <strong>{exercise.name || `Ćwiczenie ${index + 1}`}</strong>
                                        <div className="exercise-details">
                                          {exercise.sets && <span>Serie: {exercise.sets}</span>}
                                          {exercise.reps && <span>Dystans: {exercise.reps}</span>}
                                          {(exercise.distance || exercise.weight) && <span>Tempo: {exercise.distance || exercise.weight}</span>}
                                          {exercise.rest && <span>Odpoczynek: {exercise.rest}</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {training.mediaUrls && training.mediaUrls.length > 0 && (
                                  <div className="training-media">
                                    <h4>Multimedia:</h4>
                                    <div className="media-gallery">
                                      {training.mediaUrls.map((url, index) => (
                                        <div key={index} className="media-item">
                                          {url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') ? (
                                            <video src={url} controls width="200" />
                                          ) : (
                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                              <img src={url} alt={`Media ${index + 1}`} width="200" />
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'competitions' && (
                <div className="athlete-competitions-view">
                  <h3>Zawody i starty</h3>
                  {athleteCompetitions.length === 0 ? (
                    <div className="card">
                      <p>Zawodnik nie dodał jeszcze żadnych zawodów.</p>
                    </div>
                  ) : (
                    <div className="competitions-list">
                      {athleteCompetitions.map(competition => {
                        const isPast = new Date(competition.date) < new Date()
                        return (
                          <div key={competition.id} className="competition-card">
                            <div className="competition-header">
                              <h4>{competition.name}</h4>
                              <span className={`status-badge ${isPast ? 'past' : 'upcoming'}`}>
                                {isPast ? 'Przeszłe' : 'Nadchodzące'}
                              </span>
                            </div>
                            <div className="competition-info">
                              <p><strong>Data:</strong> {new Date(competition.date).toLocaleDateString('pl-PL')}</p>
                              <p><strong>Miejsce:</strong> {competition.location}</p>
                            </div>
                            {competition.events && competition.events.length > 0 && (
                              <div className="competition-events">
                                <strong>Konkurencje:</strong>
                                {competition.events.map((event, idx) => (
                                  <div key={idx} className="event-item">
                                    <span className="event-name">{event.event}</span>
                                    <div className="event-times">
                                      {event.targetTime && (
                                        <span className="event-target">Cel: {event.targetTime}</span>
                                      )}
                                      {event.actualTime && (
                                        <span className="event-actual">Wynik: {event.actualTime}</span>
                                      )}
                                    </div>
                                    {event.notes && (
                                      <p className="event-notes">{event.notes}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default AthleteView
