import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/WeeklyCalendar.css'

const WeeklyCalendar = ({ role, trainings, coachId, onRefresh, athleteId }) => {
  const { currentUser } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [scheduledTrainings, setScheduledTrainings] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [loading, setLoading] = useState(true)

  console.log('🔍 WeeklyCalendar mounted/updated, athleteId:', athleteId)

  useEffect(() => {
    console.log('🔍 useEffect triggered, athleteId:', athleteId)
    loadScheduledTrainings()
  }, [currentWeek, currentUser, athleteId])

  const loadScheduledTrainings = async () => {
    try {
      setLoading(true)
      const weekStart = getWeekStart(currentWeek)
      const weekEnd = getWeekEnd(currentWeek)

      // If athleteId is provided (coach viewing specific athlete), filter by that athlete
      // Otherwise, filter by coach (all athletes) or current athlete
      const filterField = athleteId ? 'athleteId' : (role === 'coach' ? 'coachId' : 'athleteId')
      const filterValue = athleteId || currentUser.uid

      const scheduledQuery = query(
        collection(db, 'scheduledTrainings'),
        where(filterField, '==', filterValue),
        where('scheduledDate', '>=', weekStart.toISOString()),
        where('scheduledDate', '<=', weekEnd.toISOString())
      )

      const snapshot = await getDocs(scheduledQuery)
      const scheduledData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log('🔍 DEBUG: Loaded scheduled trainings:', scheduledData)
      console.log('🔍 DEBUG: Filter field:', filterField, 'Filter value:', filterValue)
      console.log('🔍 DEBUG: Week start:', weekStart.toISOString(), 'Week end:', weekEnd.toISOString())

      setScheduledTrainings(scheduledData)
    } catch (error) {
      console.error('Error loading scheduled trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekStart = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d)
    monday.setDate(diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  }

  const getWeekEnd = (date) => {
    const start = getWeekStart(date)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return end
  }

  const getDaysOfWeek = () => {
    const start = getWeekStart(currentWeek)
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(day.getDate() + i)
      days.push(day)
    }
    console.log('🔍 Days of week:', days.map(d => d.toISOString().split('T')[0]))
    return days
  }

  const handleScheduleTraining = async (day) => {
    if (role !== 'coach' || !selectedTraining) return

    // If athleteId is not provided and we're in the general calendar view, alert the user
    if (!athleteId) {
      alert('Aby zaplanować trening dla zawodnika:\n1. Przejdź do zakładki "Zawodnicy"\n2. Kliknij w zawodnika\n3. W jego kalendarzu zaplanuj trening')
      return
    }

    try {
      const scheduledDate = new Date(day)
      scheduledDate.setHours(12, 0, 0, 0)

      await addDoc(collection(db, 'scheduledTrainings'), {
        trainingId: selectedTraining,
        coachId: currentUser.uid,
        athleteId: athleteId, // Now uses the provided athleteId
        scheduledDate: scheduledDate.toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      })

      loadScheduledTrainings()
      onRefresh?.()
      setSelectedTraining(null)
      alert('Trening dodany do kalendarza zawodnika')
    } catch (error) {
      console.error('Error scheduling training:', error)
      alert('Błąd podczas dodawania treningu do kalendarza')
    }
  }

  const handleDeleteScheduled = async (scheduledId) => {
    if (!confirm('Czy na pewno chcesz usunąć ten zaplanowany trening?')) return

    try {
      await deleteDoc(doc(db, 'scheduledTrainings', scheduledId))
      loadScheduledTrainings()
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting scheduled training:', error)
      alert('Błąd podczas usuwania treningu')
    }
  }

  const getTrainingForDay = (day) => {
    // Użyj lokalnej daty zamiast UTC
    const year = day.getFullYear()
    const month = String(day.getMonth() + 1).padStart(2, '0')
    const dayNum = String(day.getDate()).padStart(2, '0')
    const dayStr = `${year}-${month}-${dayNum}`

    const filtered = scheduledTrainings.filter(st => {
      const scheduledDate = new Date(st.scheduledDate)
      const schedYear = scheduledDate.getUTCFullYear()
      const schedMonth = String(scheduledDate.getUTCMonth() + 1).padStart(2, '0')
      const schedDay = String(scheduledDate.getUTCDate()).padStart(2, '0')
      const scheduledDay = `${schedYear}-${schedMonth}-${schedDay}`

      const match = scheduledDay === dayStr
      if (match) {
        console.log('🔍 Training match found for day:', dayStr, 'Training:', st)
      }
      return match
    })
    console.log('🔍 getTrainingForDay:', dayStr, 'Found:', filtered.length, 'trainings')
    return filtered
  }

  const previousWeek = () => {
    const prev = new Date(currentWeek)
    prev.setDate(prev.getDate() - 7)
    setCurrentWeek(prev)
  }

  const nextWeek = () => {
    const next = new Date(currentWeek)
    next.setDate(next.getDate() + 7)
    setCurrentWeek(next)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const weekStart = getWeekStart(currentWeek)
  const weekEnd = getWeekEnd(currentWeek)

  const formatWeekRange = () => {
    return `${weekStart.getDate()} ${weekStart.toLocaleDateString('pl-PL', { month: 'long' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}`
  }

  const daysOfWeek = getDaysOfWeek()

  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <button className="btn btn-secondary" onClick={previousWeek}>
          ← Poprzedni tydzień
        </button>
        <div className="calendar-title">
          <h2>{formatWeekRange()}</h2>
          <button className="btn btn-primary btn-sm" onClick={goToToday}>
            Dzisiaj
          </button>
        </div>
        <button className="btn btn-secondary" onClick={nextWeek}>
          Następny tydzień →
        </button>
      </div>

      {role === 'coach' && trainings && trainings.length > 0 && !athleteId && (
        <div className="calendar-info-box">
          <p><strong>ℹ️ Informacja:</strong> To jest widok zbiorczy wszystkich treningów.</p>
          <p>Aby zaplanować trening dla zawodnika, przejdź do zakładki "Zawodnicy" i kliknij w wybranego zawodnika.</p>
        </div>
      )}

      {role === 'coach' && trainings && trainings.length > 0 && athleteId && (
        <div className="training-selector">
          <label>Wybierz trening do dodania:</label>
          <select
            value={selectedTraining || ''}
            onChange={(e) => setSelectedTraining(e.target.value)}
            className="input-field"
          >
            <option value="">-- Wybierz trening --</option>
            {trainings.map(training => (
              <option key={training.id} value={training.id}>
                {training.title} {training.isTemplate ? '(Szablon)' : ''}
              </option>
            ))}
          </select>
          {selectedTraining && (
            <p className="hint">Kliknij na dzień, aby dodać trening</p>
          )}
        </div>
      )}

      <div className="calendar-grid">
        {daysOfWeek.map((day, index) => {
          const dayTrainings = getTrainingForDay(day)
          const dayName = day.toLocaleDateString('pl-PL', { weekday: 'long' })

          return (
            <div
              key={index}
              className={`calendar-day ${isToday(day) ? 'today' : ''} ${selectedTraining && role === 'coach' ? 'clickable' : ''}`}
              onClick={() => role === 'coach' && selectedTraining && handleScheduleTraining(day)}
            >
              <div className="day-header">
                <div className="day-name">{dayName}</div>
                <div className="day-date">{day.getDate()}</div>
              </div>
              <div className="day-trainings">
                {dayTrainings.length === 0 ? (
                  <div className="no-training">Brak treningu</div>
                ) : (
                  dayTrainings.map(st => {
                    const training = trainings.find(t => t.id === st.trainingId)
                    if (!training) return null

                    return (
                      <div key={st.id} className={`training-item ${st.completed ? 'completed' : ''}`}>
                        <div className="training-title">{training.title}</div>
                        <div className="training-meta">
                          {training.duration && <span>{training.duration} min</span>}
                          {st.completed && <span className="badge-completed">✓ Wykonane</span>}
                        </div>
                        {role === 'coach' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteScheduled(st.id)
                            }}
                          >
                            Usuń
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WeeklyCalendar
