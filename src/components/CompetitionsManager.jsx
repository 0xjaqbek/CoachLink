import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/CompetitionsManager.css'

const CompetitionsManager = ({ role }) => {
  const { currentUser } = useAuth()
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCompetition, setEditingCompetition] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    events: [{ event: '', targetTime: '', actualTime: '', notes: '' }]
  })

  useEffect(() => {
    loadCompetitions()
  }, [currentUser])

  const loadCompetitions = async () => {
    try {
      setLoading(true)

      const competitionsQuery = query(
        collection(db, 'competitions'),
        where(role === 'coach' ? 'coachId' : 'athleteId', '==', currentUser.uid),
        orderBy('date', 'desc')
      )

      const snapshot = await getDocs(competitionsQuery)
      const competitionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setCompetitions(competitionsData)
    } catch (error) {
      console.error('Error loading competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.date) {
      alert('Wypełnij wymagane pola')
      return
    }

    try {
      const competitionData = {
        name: formData.name.trim(),
        date: formData.date,
        location: formData.location.trim(),
        events: formData.events.filter(ev => ev.event.trim()),
        athleteId: role === 'athlete' ? currentUser.uid : null,
        coachId: role === 'coach' ? currentUser.uid : null,
        createdAt: editingCompetition ? editingCompetition.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (editingCompetition) {
        await updateDoc(doc(db, 'competitions', editingCompetition.id), competitionData)
      } else {
        await addDoc(collection(db, 'competitions'), competitionData)
      }

      setShowForm(false)
      setEditingCompetition(null)
      setFormData({ name: '', date: '', location: '', events: [{ event: '', targetTime: '', actualTime: '', notes: '' }] })
      loadCompetitions()
    } catch (error) {
      console.error('Error saving competition:', error)
      alert('Błąd podczas zapisywania zawodów')
    }
  }

  const handleDelete = async (competitionId) => {
    if (!confirm('Czy na pewno chcesz usunąć te zawody?')) return

    try {
      await deleteDoc(doc(db, 'competitions', competitionId))
      loadCompetitions()
    } catch (error) {
      console.error('Error deleting competition:', error)
      alert('Błąd podczas usuwania zawodów')
    }
  }

  const handleEdit = (competition) => {
    setEditingCompetition(competition)
    setFormData({
      name: competition.name,
      date: competition.date,
      location: competition.location,
      events: competition.events.length > 0 ? competition.events : [{ event: '', targetTime: '', actualTime: '', notes: '' }]
    })
    setShowForm(true)
  }

  const addEvent = () => {
    setFormData({
      ...formData,
      events: [...formData.events, { event: '', targetTime: '', actualTime: '', notes: '' }]
    })
  }

  const removeEvent = (index) => {
    const newEvents = formData.events.filter((_, i) => i !== index)
    setFormData({ ...formData, events: newEvents })
  }

  const updateEvent = (index, field, value) => {
    const newEvents = [...formData.events]
    newEvents[index][field] = value
    setFormData({ ...formData, events: newEvents })
  }

  const isPast = (date) => {
    return new Date(date) < new Date()
  }

  const upcomingCompetitions = competitions.filter(c => !isPast(c.date))
  const pastCompetitions = competitions.filter(c => isPast(c.date))

  if (loading) {
    return <div className="loading">Wczytuję zawody...</div>
  }

  return (
    <div className="competitions-manager">
      <div className="competitions-header">
        <h2>Zawody i Starty</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Dodaj zawody
        </button>
      </div>

      {showForm && (
        <div className="competition-form-overlay">
          <div className="competition-form-container card">
            <h3>{editingCompetition ? 'Edytuj zawody' : 'Nowe zawody'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nazwa zawodów *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="np. Mistrzostwa Polski Juniorów"
                  required
                />
              </div>

              <div className="form-group">
                <label>Data *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label>Miejsce</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  placeholder="np. Warszawa, Torwar"
                />
              </div>

              <div className="form-group">
                <label>Starty / Konkurencje</label>
                {formData.events.map((event, index) => (
                  <div key={index} className="event-row">
                    <input
                      type="text"
                      value={event.event}
                      onChange={(e) => updateEvent(index, 'event', e.target.value)}
                      className="input-field"
                      placeholder="Konkurencja (np. 100m kraul)"
                    />
                    <input
                      type="text"
                      value={event.targetTime}
                      onChange={(e) => updateEvent(index, 'targetTime', e.target.value)}
                      className="input-field-small"
                      placeholder="Cel (np. 55.00)"
                    />
                    <input
                      type="text"
                      value={event.actualTime}
                      onChange={(e) => updateEvent(index, 'actualTime', e.target.value)}
                      className="input-field-small"
                      placeholder="Wynik (np. 54.52)"
                    />
                    {formData.events.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEvent(index)}
                        className="btn btn-danger btn-sm"
                      >
                        Usuń
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEvent}
                  className="btn btn-secondary btn-sm"
                >
                  + Dodaj start
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingCompetition ? 'Zapisz zmiany' : 'Dodaj zawody'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCompetition(null)
                    setFormData({ name: '', date: '', location: '', events: [{ event: '', targetTime: '', actualTime: '', notes: '' }] })
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

      <div className="competitions-sections">
        {upcomingCompetitions.length > 0 && (
          <div className="competitions-section">
            <h3>Nadchodzące zawody ({upcomingCompetitions.length})</h3>
            <div className="competitions-list">
              {upcomingCompetitions.map(comp => (
                <div key={comp.id} className="competition-card card">
                  <div className="competition-header">
                    <div>
                      <h4>{comp.name}</h4>
                      <div className="competition-meta">
                        <span className="competition-date">
                          📅 {new Date(comp.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {comp.location && <span className="competition-location">📍 {comp.location}</span>}
                      </div>
                    </div>
                    <div className="competition-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleEdit(comp)}>
                        Edytuj
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(comp.id)}>
                        Usuń
                      </button>
                    </div>
                  </div>

                  {comp.events && comp.events.length > 0 && (
                    <div className="competition-events">
                      <strong>Starty:</strong>
                      {comp.events.map((event, idx) => (
                        <div key={idx} className="event-item">
                          <span className="event-name">{event.event}</span>
                          {event.targetTime && (
                            <span className="event-target">Cel: {event.targetTime}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {pastCompetitions.length > 0 && (
          <div className="competitions-section">
            <h3>Historia startów ({pastCompetitions.length})</h3>
            <div className="competitions-list">
              {pastCompetitions.map(comp => (
                <div key={comp.id} className="competition-card card past">
                  <div className="competition-header">
                    <div>
                      <h4>{comp.name}</h4>
                      <div className="competition-meta">
                        <span className="competition-date">
                          📅 {new Date(comp.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {comp.location && <span className="competition-location">📍 {comp.location}</span>}
                      </div>
                    </div>
                    <div className="competition-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleEdit(comp)}>
                        Edytuj
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(comp.id)}>
                        Usuń
                      </button>
                    </div>
                  </div>

                  {comp.events && comp.events.length > 0 && (
                    <div className="competition-events">
                      <strong>Starty:</strong>
                      {comp.events.map((event, idx) => (
                        <div key={idx} className="event-item">
                          <span className="event-name">{event.event}</span>
                          <div className="event-results">
                            {event.targetTime && <span className="event-target">Cel: {event.targetTime}</span>}
                            {event.actualTime && <span className="event-actual">Wynik: {event.actualTime}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {competitions.length === 0 && (
          <div className="card">
            <p>Brak zawodów. Dodaj pierwsze zawody, aby śledzić swoje starty i cele!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompetitionsManager
