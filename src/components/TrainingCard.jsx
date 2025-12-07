import { useState } from 'react'
import '../styles/TrainingCard.css'

const TrainingCard = ({ training, onDelete, onEdit, onAddFeedback, feedbacks = [], diaryEntries = [], role }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      alert('Wpisz treść feedbacku')
      return
    }
    onAddFeedback(training.id, feedbackText)
    setFeedbackText('')
    setShowFeedbackForm(false)
  }

  const difficultyLabels = {
    easy: 'Łatwy',
    medium: 'Średni',
    hard: 'Trudny'
  }

  const categoryLabels = {
    endurance: 'Wytrzymałość',
    technique: 'Technika',
    sprint: 'Sprint',
    strength: 'Siła',
    recovery: 'Regeneracja',
    mixed: 'Mieszany'
  }

  return (
    <div className="training-card">
      <div className="training-card-header">
        <h3>{training.title}</h3>
        <div className="badges-container">
          {training.isTemplate && (
            <span className="template-badge">Szablon</span>
          )}
          <span className={`difficulty-badge ${training.difficulty}`}>
            {difficultyLabels[training.difficulty] || training.difficulty}
          </span>
        </div>
      </div>

      {training.category && (
        <p className="training-category">Kategoria: {categoryLabels[training.category] || training.category}</p>
      )}

      {training.description && (
        <p className="training-description">{training.description}</p>
      )}

      {training.duration && (
        <p className="training-duration">Czas: {training.duration} min</p>
      )}

      <button
        className="btn btn-secondary btn-sm"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
      </button>

      {showDetails && (
        <div className="training-details">
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

          {role === 'athlete' && feedbacks.length > 0 && (
            <div className="training-feedbacks">
              <h4>Moje Opinie:</h4>
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="feedback-item-card">
                  <div className="feedback-header-card">
                    <span className="feedback-date">
                      {new Date(feedback.createdAt).toLocaleDateString('pl-PL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="feedback-text">
                    <p>{feedback.text}</p>
                  </div>
                  {feedback.response && (
                    <div className="feedback-response-card">
                      <strong>Odpowiedź trenera:</strong>
                      <p>{feedback.response}</p>
                      <span className="response-date">
                        {new Date(feedback.respondedAt).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {role === 'athlete' && diaryEntries.length > 0 && (
            <div className="training-diary-entries">
              <h4>Wpisy z Dziennika:</h4>
              {diaryEntries.map((entry) => (
                <div key={entry.id} className="diary-entry-card">
                  <div className="diary-entry-header">
                    <span className="diary-entry-date">
                      {new Date(entry.trainingDate).toLocaleDateString('pl-PL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    {entry.completed && (
                      <span className="badge-completed">✓ Wykonane</span>
                    )}
                  </div>
                  <div className="diary-entry-details">
                    <div className="diary-entry-stats">
                      {entry.feeling && (
                        <span className={`feeling-badge feeling-${entry.feeling}`}>
                          Samopoczucie: {entry.feeling}/5
                        </span>
                      )}
                      {entry.sleepHours && (
                        <span className="sleep-info">
                          Sen: {entry.sleepHours}h
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <div className="diary-entry-notes">
                        <strong>Notatki:</strong>
                        <p>{entry.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="training-card-actions">
        {role === 'coach' && (
          <>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onEdit(training)}
            >
              Edytuj
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(training.id)}
            >
              Usuń
            </button>
          </>
        )}

        {role === 'athlete' && (
          <>
            {!showFeedbackForm ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowFeedbackForm(true)}
              >
                Dodaj feedback
              </button>
            ) : (
              <div className="feedback-form">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Jak oceniasz ten trening? Co można poprawić?"
                  className="input-field"
                  rows="3"
                />
                <div className="feedback-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSubmitFeedback}
                  >
                    Wyślij
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setShowFeedbackForm(false)
                      setFeedbackText('')
                    }}
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TrainingCard
