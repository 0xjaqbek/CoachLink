import { useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../config/firebase'
import '../styles/TrainingForm.css'

const TrainingForm = ({ training, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: training?.title || '',
    description: training?.description || '',
    exercises: training?.exercises || [{ name: '', sets: '', reps: '', distance: '', rest: '' }],
    duration: training?.duration || '',
    difficulty: training?.difficulty || 'medium',
    mediaUrls: training?.mediaUrls || []
  })
  const [uploading, setUploading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...formData.exercises]
    newExercises[index][field] = value
    setFormData({ ...formData, exercises: newExercises })
  }

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: '', reps: '', distance: '', rest: '' }]
    })
  }

  const removeExercise = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index)
    setFormData({ ...formData, exercises: newExercises })
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const fileName = `trainings/${Date.now()}_${file.name}`
        const storageRef = ref(storage, fileName)
        await uploadBytes(storageRef, file)
        return await getDownloadURL(storageRef)
      })

      const urls = await Promise.all(uploadPromises)
      setFormData({
        ...formData,
        mediaUrls: [...formData.mediaUrls, ...urls]
      })
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Błąd podczas przesyłania plików')
    } finally {
      setUploading(false)
    }
  }

  const removeMedia = (index) => {
    const newMediaUrls = formData.mediaUrls.filter((_, i) => i !== index)
    setFormData({ ...formData, mediaUrls: newMediaUrls })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Tytuł treningu jest wymagany')
      return
    }
    onSubmit(formData)
  }

  return (
    <div className="training-form-overlay">
      <div className="training-form-container">
        <h2>{training ? 'Edytuj Trening' : 'Nowy Trening'}</h2>
        <form onSubmit={handleSubmit} className="training-form">
          <div className="form-group">
            <label>Tytuł treningu *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label>Opis</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Czas trwania (minuty)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>Poziom trudności</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="input-field"
            >
              <option value="easy">Łatwy</option>
              <option value="medium">Średni</option>
              <option value="hard">Trudny</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ćwiczenia</label>
            {formData.exercises.map((exercise, index) => (
              <div key={index} className="exercise-container">
                <div className="exercise-name-row">
                  <input
                    type="text"
                    placeholder="Nazwa ćwiczenia (np. Kraul - sprint, Grzbiet - technika, Motyl - seria)"
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    className="input-field"
                  />
                  {formData.exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="btn btn-danger btn-sm exercise-remove-btn"
                    >
                      X
                    </button>
                  )}
                </div>
                <div className="exercise-params-row">
                  <input
                    type="text"
                    placeholder="Serie (np. 4x)"
                    value={exercise.sets}
                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    className="input-field-small"
                  />
                  <input
                    type="text"
                    placeholder="Dystans (np. 100m, 200m)"
                    value={exercise.reps}
                    onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                    className="input-field-small"
                  />
                  <input
                    type="text"
                    placeholder="Tempo (np. 80%, aerobowe)"
                    value={exercise.distance}
                    onChange={(e) => handleExerciseChange(index, 'distance', e.target.value)}
                    className="input-field-small"
                  />
                  <input
                    type="text"
                    placeholder="Odpoczynek (np. 30s, 1min)"
                    value={exercise.rest}
                    onChange={(e) => handleExerciseChange(index, 'rest', e.target.value)}
                    className="input-field-small"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addExercise}
              className="btn btn-secondary"
            >
              + Dodaj ćwiczenie
            </button>
          </div>

          <div className="form-group">
            <label>Multimedia (zdjęcia/filmy instruktażowe)</label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="input-field"
              disabled={uploading}
            />
            {uploading && <p>Przesyłanie plików...</p>}
            {formData.mediaUrls.length > 0 && (
              <div className="media-preview">
                {formData.mediaUrls.map((url, index) => (
                  <div key={index} className="media-item">
                    {url.includes('.mp4') || url.includes('.mov') ? (
                      <video src={url} controls width="100" />
                    ) : (
                      <img src={url} alt={`Media ${index + 1}`} width="100" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="btn btn-danger btn-sm"
                    >
                      Usuń
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {training ? 'Zapisz zmiany' : 'Utwórz trening'}
            </button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TrainingForm
