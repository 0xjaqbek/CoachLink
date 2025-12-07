import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Statistics.css'

const Statistics = () => {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState({
    totalTrainings: 0,
    completedTrainings: 0,
    skippedTrainings: 0,
    averageFeeling: 0,
    averageSleep: 0,
    weeklyData: [],
    monthlyData: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month') // 'week' or 'month'

  useEffect(() => {
    loadStatistics()
  }, [currentUser, timeRange])

  const loadStatistics = async () => {
    try {
      setLoading(true)

      // Calculate date range
      const now = new Date()
      const rangeStart = new Date()
      if (timeRange === 'week') {
        rangeStart.setDate(rangeStart.getDate() - 7)
      } else {
        rangeStart.setMonth(rangeStart.getMonth() - 1)
      }

      // Load diary entries
      const entriesQuery = query(
        collection(db, 'trainingDiaryEntries'),
        where('athleteId', '==', currentUser.uid)
      )
      const entriesSnapshot = await getDocs(entriesQuery)
      const entries = entriesSnapshot.docs.map(doc => doc.data())

      // Filter by time range
      const filteredEntries = entries.filter(entry =>
        new Date(entry.createdAt) >= rangeStart
      )

      // Calculate statistics
      const completed = filteredEntries.filter(e => e.completed).length
      const skipped = filteredEntries.filter(e => !e.completed).length
      const totalTrainings = filteredEntries.length

      const feelingsSum = filteredEntries.reduce((sum, e) => sum + (e.feeling || 0), 0)
      const averageFeeling = totalTrainings > 0 ? (feelingsSum / totalTrainings).toFixed(1) : 0

      const sleepEntries = filteredEntries.filter(e => e.sleepHours)
      const sleepSum = sleepEntries.reduce((sum, e) => sum + (e.sleepHours || 0), 0)
      const averageSleep = sleepEntries.length > 0 ? (sleepSum / sleepEntries.length).toFixed(1) : 0

      // Group by day for chart
      const dayGroups = {}
      filteredEntries.forEach(entry => {
        const day = new Date(entry.createdAt).toISOString().split('T')[0]
        if (!dayGroups[day]) {
          dayGroups[day] = { completed: 0, skipped: 0 }
        }
        if (entry.completed) {
          dayGroups[day].completed++
        } else {
          dayGroups[day].skipped++
        }
      })

      const chartData = Object.keys(dayGroups)
        .sort()
        .slice(-14) // Last 14 days
        .map(day => ({
          date: new Date(day).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
          completed: dayGroups[day].completed,
          skipped: dayGroups[day].skipped
        }))

      setStats({
        totalTrainings,
        completedTrainings: completed,
        skippedTrainings: skipped,
        averageFeeling,
        averageSleep,
        weeklyData: chartData,
        completionRate: totalTrainings > 0 ? ((completed / totalTrainings) * 100).toFixed(0) : 0
      })
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const feelingLabel = (feeling) => {
    const labels = {
      1: 'Bardzo słabo',
      2: 'Słabo',
      3: 'Średnio',
      4: 'Dobrze',
      5: 'Bardzo dobrze'
    }
    const rounded = Math.round(feeling)
    return labels[rounded] || 'Brak danych'
  }

  if (loading) {
    return <div className="loading">Wczytuję statystyki...</div>
  }

  return (
    <div className="statistics">
      <div className="stats-header">
        <h2>Statystyki</h2>
        <div className="time-range-selector">
          <button
            className={`btn btn-sm ${timeRange === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeRange('week')}
          >
            Tydzień
          </button>
          <button
            className={`btn btn-sm ${timeRange === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeRange('month')}
          >
            Miesiąc
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTrainings}</div>
            <div className="stat-label">Wszystkie treningi</div>
          </div>
        </div>

        <div className="stat-card card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedTrainings}</div>
            <div className="stat-label">Wykonane</div>
          </div>
        </div>

        <div className="stat-card card warning">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-value">{stats.skippedTrainings}</div>
            <div className="stat-label">Opuszczone</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completionRate}%</div>
            <div className="stat-label">Wykonalność</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">😊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.averageFeeling || '-'}</div>
            <div className="stat-label">Średnie samopoczucie</div>
            <div className="stat-sublabel">{feelingLabel(stats.averageFeeling)}</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">😴</div>
          <div className="stat-content">
            <div className="stat-value">{stats.averageSleep || '-'}h</div>
            <div className="stat-label">Średni sen</div>
          </div>
        </div>
      </div>

      {stats.weeklyData.length > 0 && (
        <div className="chart-container card">
          <h3>Aktywność treningowa</h3>
          <div className="simple-chart">
            {stats.weeklyData.map((day, index) => {
              const total = day.completed + day.skipped
              const maxHeight = 100
              const height = total > 0 ? (total / Math.max(...stats.weeklyData.map(d => d.completed + d.skipped))) * maxHeight : 0

              return (
                <div key={index} className="chart-bar-wrapper">
                  <div className="chart-bar-container" style={{ height: `${maxHeight}px` }}>
                    <div
                      className="chart-bar"
                      style={{
                        height: `${height}px`,
                        background: day.completed > 0 ? '#34a853' : '#ea4335'
                      }}
                      title={`${day.completed} wykonane, ${day.skipped} opuszczone`}
                    >
                      <span className="bar-value">{total}</span>
                    </div>
                  </div>
                  <div className="chart-label">{day.date}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {stats.totalTrainings === 0 && (
        <div className="card no-data">
          <p>Brak danych statystycznych. Zacznij zapisywać wpisy w dzienniku treningowym!</p>
        </div>
      )}
    </div>
  )
}

export default Statistics
