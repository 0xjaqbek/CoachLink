import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import TrainingCard from '../components/TrainingCard'
import TrainingForm from '../components/TrainingForm'
import FeedbackList from '../components/FeedbackList'
import Messages from '../components/Messages'
import WeeklyCalendar from '../components/WeeklyCalendar'
import AthleteView from '../components/AthleteView'
import '../styles/Dashboard.css'

const CoachDashboard = () => {
  const { currentUser } = useAuth()
  const [trainings, setTrainings] = useState([])
  const [athletes, setAthletes] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTraining, setEditingTraining] = useState(null)
  const [activeTab, setActiveTab] = useState('trainings')
  const [trainingFilter, setTrainingFilter] = useState('all') // 'all', 'regular', 'templates'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedAthlete, setSelectedAthlete] = useState(null)

  useEffect(() => {
    loadData()
  }, [currentUser])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load trainings
      const trainingsQuery = query(
        collection(db, 'trainings'),
        where('coachId', '==', currentUser.uid)
      )
      const trainingsSnapshot = await getDocs(trainingsQuery)
      const trainingsData = trainingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTrainings(trainingsData)

      // Load athletes
      const athletesQuery = query(
        collection(db, 'users'),
        where('coachId', '==', currentUser.uid)
      )
      const athletesSnapshot = await getDocs(athletesQuery)
      const athletesData = athletesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setAthletes(athletesData)

      // Load feedbacks for all trainings
      const trainingIds = trainingsData.map(t => t.id)
      if (trainingIds.length > 0) {
        const feedbacksQuery = query(
          collection(db, 'feedback'),
          where('trainingId', 'in', trainingIds)
        )
        const feedbacksSnapshot = await getDocs(feedbacksQuery)
        const feedbacksData = feedbacksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setFeedbacks(feedbacksData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTraining = async (trainingData, saveAsTemplate = false) => {
    try {
      const trainingDoc = {
        ...trainingData,
        coachId: currentUser.uid,
        coachName: currentUser.displayName,
        isTemplate: saveAsTemplate,
        createdAt: new Date().toISOString()
      }

      await addDoc(collection(db, 'trainings'), trainingDoc)

      setShowForm(false)
      loadData()
      alert(saveAsTemplate ? 'Trening zapisany jako szablon!' : 'Trening utworzony!')
    } catch (error) {
      console.error('Error creating training:', error)
      alert('Błąd podczas tworzenia treningu')
    }
  }

  const handleUpdateTraining = async (trainingData, saveAsTemplate = false) => {
    try {
      await updateDoc(doc(db, 'trainings', editingTraining.id), {
        ...trainingData,
        isTemplate: saveAsTemplate || editingTraining.isTemplate,
        updatedAt: new Date().toISOString()
      })

      setEditingTraining(null)
      setShowForm(false)
      loadData()
    } catch (error) {
      console.error('Error updating training:', error)
      alert('Błąd podczas aktualizacji treningu')
    }
  }

  const handleDeleteTraining = async (trainingId) => {
    if (!confirm('Czy na pewno chcesz usunąć ten trening?')) return

    try {
      await deleteDoc(doc(db, 'trainings', trainingId))
      loadData()
    } catch (error) {
      console.error('Error deleting training:', error)
      alert('Błąd podczas usuwania treningu')
    }
  }

  const handleRespondToFeedback = async (feedbackId, response) => {
    try {
      await updateDoc(doc(db, 'feedback', feedbackId), {
        response,
        respondedAt: new Date().toISOString()
      })

      loadData()
    } catch (error) {
      console.error('Error responding to feedback:', error)
      alert('Błąd podczas odpowiadania na feedback')
    }
  }

  const handleEditTraining = (training) => {
    setEditingTraining(training)
    setShowForm(true)
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="container">
          <div className="loading">Wczytuję dane...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="container">
        <div className="dashboard-header">
          <h1>Panel Trenera</h1>
          <p>Zawodnicy: {athletes.length}</p>
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
            className={`tab ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            Feedback ({feedbacks.filter(f => !f.response).length})
          </button>
          <button
            className={`tab ${activeTab === 'athletes' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('athletes')
              setSelectedAthlete(null)
            }}
          >
            Zawodnicy ({athletes.length})
          </button>
          <button
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Wiadomości
          </button>
        </div>

        {activeTab === 'trainings' && (
          <div>
            <div className="section-header">
              <h2>Moje Treningi</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingTraining(null)
                  setShowForm(true)
                }}
              >
                + Dodaj Trening
              </button>
            </div>

            <div className="filters-row">
              <div className="filter-group">
                <label>Typ:</label>
                <select
                  value={trainingFilter}
                  onChange={(e) => setTrainingFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Wszystkie</option>
                  <option value="regular">Tylko treningi</option>
                  <option value="templates">Tylko szablony</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Kategoria:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Wszystkie</option>
                  <option value="endurance">Wytrzymałość</option>
                  <option value="technique">Technika</option>
                  <option value="sprint">Sprint</option>
                  <option value="strength">Siła</option>
                  <option value="recovery">Regeneracja</option>
                  <option value="mixed">Mieszany</option>
                </select>
              </div>
            </div>

            {showForm && (
              <TrainingForm
                training={editingTraining}
                onSubmit={editingTraining ? handleUpdateTraining : handleCreateTraining}
                onCancel={() => {
                  setShowForm(false)
                  setEditingTraining(null)
                }}
                isTemplate={editingTraining?.isTemplate}
              />
            )}

            {(() => {
              const filtered = trainings.filter(t => {
                const typeMatch = trainingFilter === 'all' ||
                  (trainingFilter === 'regular' && !t.isTemplate) ||
                  (trainingFilter === 'templates' && t.isTemplate)
                const categoryMatch = categoryFilter === 'all' || t.category === categoryFilter
                return typeMatch && categoryMatch
              })

              return filtered.length === 0 ? (
                <div className="card">
                  <p>Brak treningów pasujących do filtrów.</p>
                </div>
              ) : (
                <div className="trainings-grid">
                  {filtered.map(training => (
                    <TrainingCard
                      key={training.id}
                      training={training}
                      onDelete={handleDeleteTraining}
                      onEdit={handleEditTraining}
                      role="coach"
                      isTemplate={training.isTemplate}
                    />
                  ))}
                </div>
              )
            })()}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            <h2>Feedback od zawodników</h2>
            <FeedbackList
              feedbacks={feedbacks}
              trainings={trainings}
              onRespond={handleRespondToFeedback}
            />
          </div>
        )}

        {activeTab === 'athletes' && (
          <div>
            {!selectedAthlete ? (
              <>
                <h2>Moi Zawodnicy</h2>
                {athletes.length === 0 ? (
                  <div className="card">
                    <p>Brak przypisanych zawodników. Administrator może przypisać zawodników do Twojego konta.</p>
                  </div>
                ) : (
                  <div className="athletes-list">
                    {athletes.map(athlete => (
                      <div
                        key={athlete.id}
                        className="card athlete-card clickable-athlete"
                        onClick={() => setSelectedAthlete(athlete)}
                      >
                        <div className="athlete-info">
                          {athlete.photoURL && (
                            <img src={athlete.photoURL} alt={athlete.displayName} className="athlete-avatar" />
                          )}
                          <div>
                            <h3>{athlete.displayName}</h3>
                            <p>{athlete.email}</p>
                          </div>
                        </div>
                        <div className="athlete-card-arrow">→</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedAthlete(null)}
                  style={{ marginBottom: '20px' }}
                >
                  ← Powrót do listy zawodników
                </button>
                <AthleteView
                  athletes={[selectedAthlete]}
                  coachId={currentUser.uid}
                  trainings={trainings}
                  onRefresh={loadData}
                  preselectedAthleteId={selectedAthlete.id}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <WeeklyCalendar
            role="coach"
            trainings={trainings}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'messages' && (
          <Messages role="coach" athletes={athletes} />
        )}
      </div>
    </>
  )
}

export default CoachDashboard
