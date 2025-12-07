import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import TrainingCard from '../components/TrainingCard'
import TrainingForm from '../components/TrainingForm'
import FeedbackList from '../components/FeedbackList'
import Messages from '../components/Messages'
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

  const handleCreateTraining = async (trainingData) => {
    try {
      await addDoc(collection(db, 'trainings'), {
        ...trainingData,
        coachId: currentUser.uid,
        coachName: currentUser.displayName,
        createdAt: new Date().toISOString()
      })

      setShowForm(false)
      loadData()
    } catch (error) {
      console.error('Error creating training:', error)
      alert('Błąd podczas tworzenia treningu')
    }
  }

  const handleUpdateTraining = async (trainingData) => {
    try {
      await updateDoc(doc(db, 'trainings', editingTraining.id), {
        ...trainingData,
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
            onClick={() => setActiveTab('athletes')}
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

            {showForm && (
              <TrainingForm
                training={editingTraining}
                onSubmit={editingTraining ? handleUpdateTraining : handleCreateTraining}
                onCancel={() => {
                  setShowForm(false)
                  setEditingTraining(null)
                }}
              />
            )}

            {trainings.length === 0 ? (
              <div className="card">
                <p>Brak treningów. Dodaj pierwszy trening!</p>
              </div>
            ) : (
              <div className="trainings-grid">
                {trainings.map(training => (
                  <TrainingCard
                    key={training.id}
                    training={training}
                    onDelete={handleDeleteTraining}
                    onEdit={handleEditTraining}
                    role="coach"
                  />
                ))}
              </div>
            )}
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
            <h2>Moi Zawodnicy</h2>
            {athletes.length === 0 ? (
              <div className="card">
                <p>Brak przypisanych zawodników. Administrator może przypisać zawodników do Twojego konta.</p>
              </div>
            ) : (
              <div className="athletes-list">
                {athletes.map(athlete => (
                  <div key={athlete.id} className="card athlete-card">
                    <div className="athlete-info">
                      {athlete.photoURL && (
                        <img src={athlete.photoURL} alt={athlete.displayName} className="athlete-avatar" />
                      )}
                      <div>
                        <h3>{athlete.displayName}</h3>
                        <p>{athlete.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <Messages role="coach" athletes={athletes} />
        )}
      </div>
    </>
  )
}

export default CoachDashboard
