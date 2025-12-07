import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/TrainingDiary.css'

const TrainingDiary = () => {
  const { currentUser } = useAuth()
  const [entries, setEntries] = useState([])
  const [scheduledTrainings, setScheduledTrainings] = useState([])
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedScheduled, setSelectedScheduled] = useState(null)
  const [expandedEntries, setExpandedEntries] = useState({})
  const [formData, setFormData] = useState({
    feeling: 5,
    notes: '',
    sleepHours: '',
    completionStatus: 'completed' // completed, partial, skipped
  })

  useEffect(() => {
    loadData()
  }, [currentUser])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load diary entries
      const entriesQuery = query(
        collection(db, 'trainingDiaryEntries'),
        where('athleteId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )
      const entriesSnapshot = await getDocs(entriesQuery)
      const entriesData = entriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setEntries(entriesData)

      // Load scheduled trainings for today and past week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const scheduledQuery = query(
        collection(db, 'scheduledTrainings'),
        where('athleteId', '==', currentUser.uid),
        where('scheduledDate', '>=', weekAgo.toISOString())
      )
      const scheduledSnapshot = await getDocs(scheduledQuery)
      const scheduledData = scheduledSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setScheduledTrainings(scheduledData)

      // Load trainings details
      if (scheduledData.length > 0) {
        const trainingIds = [...new Set(scheduledData.map(st => st.trainingId))]
        const trainingsData = []
        for (const trainingId of trainingIds) {
          const trainingQuery = query(
            collection(db, 'trainings'),
            where('__name__', '==', trainingId)
          )
          const trainingSnapshot = await getDocs(trainingQuery)
          trainingSnapshot.forEach(doc => {
            trainingsData.push({ id: doc.id, ...doc.data() })
          })
        }
        setTrainings(trainingsData)
      }
    } catch (error) {
      console.error('Error loading diary data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntry = async (e) => {
    e.preventDefault()

    if (!selectedScheduled) {
      alert('Wybierz trening')
      return
    }

    try {
      await addDoc(collection(db, 'trainingDiaryEntries'), {
        athleteId: currentUser.uid,
        scheduledTrainingId: selectedScheduled.id,
        trainingId: selectedScheduled.trainingId,
        feeling: parseInt(formData.feeling),
        notes: formData.notes.trim(),
        sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : null,
        completionStatus: formData.completionStatus,
        completed: formData.completionStatus === 'completed', // backwards compatibility
        createdAt: new Date().toISOString()
      })

      // Mark scheduled training as completed
      if (formData.completionStatus === 'completed') {
        await updateDoc(doc(db, 'scheduledTrainings', selectedScheduled.id), {
          completed: true
        })
      }

      setShowForm(false)
      setSelectedScheduled(null)
      setFormData({ feeling: 5, notes: '', sleepHours: '', completionStatus: 'completed' })
      loadData()
    } catch (error) {
      console.error('Error adding diary entry:', error)
      alert('Błąd podczas dodawania wpisu')
    }
  }

  const getTrainingTitle = (trainingId) => {
    const training = trainings.find(t => t.id === trainingId)
    return training ? training.title : 'Trening'
  }

  const getTrainingDetails = (trainingId) => {
    return trainings.find(t => t.id === trainingId)
  }

  const toggleEntryExpansion = (entryId) => {
    setExpandedEntries(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }))
  }

  const feelingLabels = {
    1: 'Bardzo słabo',
    2: 'Słabo',
    3: 'Średnio',
    4: 'Dobrze',
    5: 'Bardzo dobrze'
  }

  const pendingTrainings = scheduledTrainings.filter(st => {
    const hasEntry = entries.some(e => e.scheduledTrainingId === st.id)
    return !hasEntry && new Date(st.scheduledDate) <= new Date()
  })

  if (loading) {
    return <div className="loading">Wczytuję dziennik...</div>
  }

  return (
    <div className="training-diary">
      <div className="diary-header">
        <h2>Dziennik Treningowy</h2>
        {pendingTrainings.length > 0 && !showForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Dodaj wpis
          </button>
        )}
      </div>

      {showForm && (
        <div className="diary-form-overlay">
          <div className="diary-form-container card">
            <h3>Nowy wpis w dzienniku</h3>
            <form onSubmit={handleAddEntry}>
              <div className="form-group">
                <label>Wybierz trening *</label>
                <select
                  value={selectedScheduled?.id || ''}
                  onChange={(e) => {
                    const st = pendingTrainings.find(st => st.id === e.target.value)
                    setSelectedScheduled(st)
                  }}
                  className="input-field"
                  required
                >
                  <option value="">-- Wybierz trening --</option>
                  {pendingTrainings.map(st => (
                    <option key={st.id} value={st.id}>
                      {getTrainingTitle(st.trainingId)} - {new Date(st.scheduledDate).toLocaleDateString('pl-PL')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status wykonania treningu</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      checked={formData.completionStatus === 'completed'}
                      onChange={() => setFormData({ ...formData, completionStatus: 'completed' })}
                    />
                    Wykonany w całości
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={formData.completionStatus === 'partial'}
                      onChange={() => setFormData({ ...formData, completionStatus: 'partial' })}
                    />
                    Częściowo wykonany
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={formData.completionStatus === 'skipped'}
                      onChange={() => setFormData({ ...formData, completionStatus: 'skipped' })}
                    />
                    Niewykonany
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Samopoczucie (1-5): {feelingLabels[formData.feeling]}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.feeling}
                  onChange={(e) => setFormData({ ...formData, feeling: e.target.value })}
                  className="feeling-slider"
                />
                <div className="feeling-labels">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>

              <div className="form-group">
                <label>Godziny snu</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                  className="input-field"
                  placeholder="np. 8"
                />
              </div>

              <div className="form-group">
                <label>Notatki</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Jak się czułeś? Problemy? Sukcesy?"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Zapisz wpis
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedScheduled(null)
                    setFormData({ feeling: 5, notes: '', sleepHours: '', completed: true })
                  }}
                  className="btn btn-secondary"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="card">
          <p>Brak wpisów w dzienniku. Dodaj pierwszy wpis po wykonaniu treningu!</p>
        </div>
      ) : (
        <div className="diary-entries">
          {entries.map(entry => {
            const training = getTrainingDetails(entry.trainingId)
            const isExpanded = expandedEntries[entry.id]

            return (
              <div key={entry.id} className="diary-entry card">
                <div className="entry-header">
                  <h3>{getTrainingTitle(entry.trainingId)}</h3>
                  <span className="entry-date">
                    {new Date(entry.createdAt).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="entry-stats">
                  <div className="stat">
                    <span className="stat-label">Status:</span>
                    <span className={`stat-value ${
                      (entry.completionStatus || (entry.completed ? 'completed' : 'skipped')) === 'completed' ? 'completed' :
                      (entry.completionStatus || (entry.completed ? 'completed' : 'skipped')) === 'partial' ? 'partial' :
                      'skipped'
                    }`}>
                      {(entry.completionStatus || (entry.completed ? 'completed' : 'skipped')) === 'completed' ? '✓ Wykonany w całości' :
                       (entry.completionStatus || (entry.completed ? 'completed' : 'skipped')) === 'partial' ? '◐ Częściowo wykonany' :
                       '✗ Niewykonany'}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Samopoczucie:</span>
                    <span className="stat-value">{feelingLabels[entry.feeling]}</span>
                  </div>
                  {entry.sleepHours && (
                    <div className="stat">
                      <span className="stat-label">Sen:</span>
                      <span className="stat-value">{entry.sleepHours}h</span>
                    </div>
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
                        <strong>Kategoria:</strong> {training.category}
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
  )
}

export default TrainingDiary
