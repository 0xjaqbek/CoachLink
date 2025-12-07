import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/WeeklyCalendar.css'

const WeeklyCalendar = ({ role, trainings, coachId, onRefresh }) => {
  const { currentUser } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [scheduledTrainings, setScheduledTrainings] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScheduledTrainings()
  }, [currentWeek, currentUser])

  const loadScheduledTrainings = async () => {
    try {
      setLoading(true)
      const weekStart = getWeekStart(currentWeek)
      const weekEnd = getWeekEnd(currentWeek)

      const scheduledQuery = query(
        collection(db, 'scheduledTrainings'),
        where(role === 'coach' ? 'coachId' : 'athleteId', '==', role === 'coach' ? currentUser.uid : currentUser.uid),
        where('scheduledDate', '>=', weekStart.toISOString()),
        where('scheduledDate', '<=', weekEnd.toISOString())
      )

      const snapshot = await getDocs(scheduledQuery)
      const scheduledData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setScheduledTrainings(scheduledData)
    } catch (error) {
      console.error('Error loading scheduled trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
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
    return days
  }

  const handleScheduleTraining = async (day) => {
    if (role !== 'coach' || !selectedTraining) return

    try {
      const scheduledDate = new Date(day)
      scheduledDate.setHours(12, 0, 0, 0)

      await addDoc(collection(db, 'scheduledTrainings'), {
        trainingId: selectedTraining,
        coachId: currentUser.uid,
        athleteId: null, // Będzie ustawione przez admina/trenera podczas przypisywania
        scheduledDate: scheduledDate.toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      })

      loadScheduledTrainings()
      onRefresh?.()
      setSelectedTraining(null)
      alert('Trening dodany do kalendarza')
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
    const dayStr = day.toISOString().split('T')[0]
    return scheduledTrainings.filter(st => {
      const scheduledDay = new Date(st.scheduledDate).toISOString().split('T')[0]
      return scheduledDay === dayStr
    })
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

      {role === 'coach' && trainings && trainings.length > 0 && (
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
                {training.title}
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
