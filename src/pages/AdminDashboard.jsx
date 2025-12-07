import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../config/firebase'
import Navigation from '../components/Navigation'
import '../styles/Dashboard.css'
import '../styles/Admin.css'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load all users
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersData)

      // Load all trainings
      const trainingsSnapshot = await getDocs(collection(db, 'trainings'))
      const trainingsData = trainingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTrainings(trainingsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole })
      loadData()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Błąd podczas aktualizacji roli')
    }
  }

  const handleAssignCoach = async (athleteId, coachId) => {
    try {
      await updateDoc(doc(db, 'users', athleteId), {
        coachId: coachId || null
      })
      loadData()
    } catch (error) {
      console.error('Error assigning coach:', error)
      alert('Błąd podczas przypisywania trenera')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return

    try {
      await deleteDoc(doc(db, 'users', userId))
      loadData()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Błąd podczas usuwania użytkownika')
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

  const coaches = users.filter(u => u.role === 'coach')
  const athletes = users.filter(u => u.role === 'athlete')
  const unassignedUsers = users.filter(u => !u.role)

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
          <h1>Panel Administratora</h1>
          <div className="stats">
            <div className="stat">
              <span className="stat-value">{users.length}</span>
              <span className="stat-label">Użytkowników</span>
            </div>
            <div className="stat">
              <span className="stat-value">{coaches.length}</span>
              <span className="stat-label">Trenerów</span>
            </div>
            <div className="stat">
              <span className="stat-value">{athletes.length}</span>
              <span className="stat-label">Zawodników</span>
            </div>
            <div className="stat">
              <span className="stat-value">{trainings.length}</span>
              <span className="stat-label">Treningów</span>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Użytkownicy
          </button>
          <button
            className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Przypisania
          </button>
          <button
            className={`tab ${activeTab === 'trainings' ? 'active' : ''}`}
            onClick={() => setActiveTab('trainings')}
          >
            Wszystkie Treningi
          </button>
        </div>

        {activeTab === 'users' && (
          <div>
            {unassignedUsers.length > 0 && (
              <div>
                <h2>Użytkownicy bez roli ({unassignedUsers.length})</h2>
                <div className="users-table">
                  {unassignedUsers.map(user => (
                    <div key={user.id} className="card user-row">
                      <div className="user-info">
                        {user.photoURL && (
                          <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                        )}
                        <div>
                          <h3>{user.displayName}</h3>
                          <p>{user.email}</p>
                        </div>
                      </div>
                      <div className="user-actions">
                        <select
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          defaultValue=""
                          className="role-select"
                        >
                          <option value="" disabled>Wybierz rolę</option>
                          <option value="athlete">Zawodnik</option>
                          <option value="coach">Trener</option>
                          <option value="admin">Administrator</option>
                        </select>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2>Wszyscy Użytkownicy</h2>
            <div className="users-table">
              {users.filter(u => u.role).map(user => (
                <div key={user.id} className="card user-row">
                  <div className="user-info">
                    {user.photoURL && (
                      <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                    )}
                    <div>
                      <h3>{user.displayName}</h3>
                      <p>{user.email}</p>
                      <span className={`badge badge-${user.role}`}>{user.role}</span>
                    </div>
                  </div>
                  <div className="user-actions">
                    <select
                      value={user.role || ''}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="athlete">Zawodnik</option>
                      <option value="coach">Trener</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <h2>Przypisywanie Zawodników do Trenerów</h2>
            {athletes.length === 0 ? (
              <div className="card">
                <p>Brak zawodników do przypisania.</p>
              </div>
            ) : coaches.length === 0 ? (
              <div className="card">
                <p>Brak trenerów. Najpierw nadaj komuś rolę trenera.</p>
              </div>
            ) : (
              <div className="assignments-table">
                {athletes.map(athlete => {
                  const coach = coaches.find(c => c.id === athlete.coachId)
                  return (
                    <div key={athlete.id} className="card assignment-row">
                      <div className="user-info">
                        {athlete.photoURL && (
                          <img src={athlete.photoURL} alt={athlete.displayName} className="user-avatar" />
                        )}
                        <div>
                          <h3>{athlete.displayName}</h3>
                          <p>{athlete.email}</p>
                        </div>
                      </div>
                      <div className="assignment-info">
                        <label>Przypisany trener:</label>
                        <select
                          value={athlete.coachId || ''}
                          onChange={(e) => handleAssignCoach(athlete.id, e.target.value)}
                          className="coach-select"
                        >
                          <option value="">Brak</option>
                          {coaches.map(coach => (
                            <option key={coach.id} value={coach.id}>
                              {coach.displayName}
                            </option>
                          ))}
                        </select>
                        {coach && (
                          <span className="current-coach">
                            Aktualnie: {coach.displayName}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trainings' && (
          <div>
            <h2>Wszystkie Treningi ({trainings.length})</h2>
            {trainings.length === 0 ? (
              <div className="card">
                <p>Brak treningów w systemie.</p>
              </div>
            ) : (
              <div className="trainings-table">
                {trainings.map(training => (
                  <div key={training.id} className="card training-row">
                    <div>
                      <h3>{training.title}</h3>
                      <p>{training.description}</p>
                      <small>Trener: {training.coachName}</small>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteTraining(training.id)}
                    >
                      Usuń
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default AdminDashboard
