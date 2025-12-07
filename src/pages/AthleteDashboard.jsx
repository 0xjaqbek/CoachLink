import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import TrainingCard from '../components/TrainingCard'
import Messages from '../components/Messages'
import WeeklyCalendar from '../components/WeeklyCalendar'
import TrainingDiary from '../components/TrainingDiary'
import Statistics from '../components/Statistics'
import CompetitionsManager from '../components/CompetitionsManager'
import '../styles/Dashboard.css'

const AthleteDashboard = () => {
  const { currentUser } = useAuth()
  const [trainings, setTrainings] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [coachName, setCoachName] = useState('')
  const [coachId, setCoachId] = useState(null)
  const [activeTab, setActiveTab] = useState('trainings')

  useEffect(() => {
    loadTrainings()
  }, [currentUser])

  const loadTrainings = async () => {
    try {
      setLoading(true)

      // Get user data to find coach ID
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      const userData = userDoc.data()

      if (!userData.coachId) {
        setLoading(false)
        return
      }

      // Get coach name and ID
      setCoachId(userData.coachId)
      const coachDoc = await getDoc(doc(db, 'users', userData.coachId))
      if (coachDoc.exists()) {
        setCoachName(coachDoc.data().displayName)
      }

      // Get trainings from coach
      const trainingsQuery = query(
        collection(db, 'trainings'),
        where('coachId', '==', userData.coachId)
      )

      const snapshot = await getDocs(trainingsQuery)
      const trainingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setTrainings(trainingsData)

      // Get feedbacks for this athlete
      const feedbacksQuery = query(
        collection(db, 'feedback'),
        where('athleteId', '==', currentUser.uid)
      )
      const feedbacksSnapshot = await getDocs(feedbacksQuery)
      const feedbacksData = feedbacksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setFeedbacks(feedbacksData)
    } catch (error) {
      console.error('Error loading trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFeedback = async (trainingId, feedbackText) => {
    try {
      await addDoc(collection(db, 'feedback'), {
        trainingId,
        athleteId: currentUser.uid,
        athleteName: currentUser.displayName,
        text: feedbackText,
        createdAt: new Date().toISOString(),
        response: null
      })

      alert('Feedback dodany pomyślnie!')
      loadTrainings() // Reload to show new feedback
    } catch (error) {
      console.error('Error adding feedback:', error)
      alert('Błąd podczas dodawania feedbacku')
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="container">
          <div className="loading">Wczytuję treningi...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="container">
        <div className="dashboard-header">
          <h1>Panel Zawodnika</h1>
          {coachName && <p className="coach-info">Trener: {coachName}</p>}
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Kalendarz
          </button>
          <button
            className={`tab ${activeTab === 'trainings' ? 'active' : ''}`}
            onClick={() => setActiveTab('trainings')}
          >
            Treningi ({trainings.length})
          </button>
          <button
            className={`tab ${activeTab === 'diary' ? 'active' : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            Dziennik
          </button>
          <button
            className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            Statystyki
          </button>
          <button
            className={`tab ${activeTab === 'competitions' ? 'active' : ''}`}
            onClick={() => setActiveTab('competitions')}
          >
            Zawody
          </button>
          <button
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Wiadomości
          </button>
        </div>

        {activeTab === 'trainings' && (
          <>
            {!coachName ? (
              <div className="card">
                <h3>Brak przypisanego trenera</h3>
                <p>Skontaktuj się z administratorem w celu przypisania do trenera.</p>
              </div>
            ) : trainings.length === 0 ? (
              <div className="card">
                <h3>Brak treningów</h3>
                <p>Twój trener jeszcze nie dodał żadnych treningów.</p>
              </div>
            ) : (
              <div className="trainings-grid">
                {trainings.map(training => (
                  <TrainingCard
                    key={training.id}
                    training={training}
                    onAddFeedback={handleAddFeedback}
                    feedbacks={feedbacks.filter(f => f.trainingId === training.id)}
                    role="athlete"
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'calendar' && (
          <WeeklyCalendar
            role="athlete"
            trainings={trainings}
            coachId={coachId}
            onRefresh={loadTrainings}
          />
        )}

        {activeTab === 'diary' && <TrainingDiary />}

        {activeTab === 'statistics' && <Statistics />}

        {activeTab === 'competitions' && <CompetitionsManager role="athlete" />}

        {activeTab === 'messages' && (
          <Messages role="athlete" coachId={coachId} />
        )}
      </div>
    </>
  )
}

export default AthleteDashboard
