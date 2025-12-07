import { useState } from 'react'
import '../styles/FeedbackList.css'

const FeedbackList = ({ feedbacks, trainings, onRespond }) => {
  const [responses, setResponses] = useState({})
  const [showResponseForm, setShowResponseForm] = useState({})

  const handleResponseChange = (feedbackId, value) => {
    setResponses({
      ...responses,
      [feedbackId]: value
    })
  }

  const handleSubmitResponse = (feedbackId) => {
    const response = responses[feedbackId]
    if (!response?.trim()) {
      alert('Wpisz treść odpowiedzi')
      return
    }
    onRespond(feedbackId, response)
    setResponses({
      ...responses,
      [feedbackId]: ''
    })
    setShowResponseForm({
      ...showResponseForm,
      [feedbackId]: false
    })
  }

  const toggleResponseForm = (feedbackId) => {
    setShowResponseForm({
      ...showResponseForm,
      [feedbackId]: !showResponseForm[feedbackId]
    })
  }

  if (feedbacks.length === 0) {
    return (
      <div className="card">
        <p>Brak feedbacku od zawodników.</p>
      </div>
    )
  }

  return (
    <div className="feedback-list">
      {feedbacks.map((feedback) => {
        const training = trainings.find(t => t.id === feedback.trainingId)
        return (
          <div key={feedback.id} className="card feedback-item">
            <div className="feedback-header">
              <div>
                <h3>{feedback.athleteName}</h3>
                {training && <p className="training-title">Trening: {training.title}</p>}
                <small>{new Date(feedback.createdAt).toLocaleDateString('pl-PL')}</small>
              </div>
              {feedback.response ? (
                <span className="badge badge-success">Odpowiedziano</span>
              ) : (
                <span className="badge badge-pending">Oczekuje</span>
              )}
            </div>

            <div className="feedback-content">
              <p><strong>Feedback:</strong></p>
              <p>{feedback.text}</p>
            </div>

            {feedback.response ? (
              <div className="feedback-response">
                <p><strong>Twoja odpowiedź:</strong></p>
                <p>{feedback.response}</p>
                <small>Odpowiedziano: {new Date(feedback.respondedAt).toLocaleDateString('pl-PL')}</small>
              </div>
            ) : (
              <>
                {!showResponseForm[feedback.id] ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => toggleResponseForm(feedback.id)}
                  >
                    Odpowiedz
                  </button>
                ) : (
                  <div className="response-form">
                    <textarea
                      value={responses[feedback.id] || ''}
                      onChange={(e) => handleResponseChange(feedback.id, e.target.value)}
                      placeholder="Wpisz swoją odpowiedź..."
                      className="input-field"
                      rows="3"
                    />
                    <div className="response-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSubmitResponse(feedback.id)}
                      >
                        Wyślij odpowiedź
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleResponseForm(feedback.id)}
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default FeedbackList
