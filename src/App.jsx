import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import AthleteDashboard from './pages/AthleteDashboard'
import CoachDashboard from './pages/CoachDashboard'
import AdminDashboard from './pages/AdminDashboard'
import GuidePanel from './pages/GuidePanel'
import ProtectedRoute from './components/ProtectedRoute'
import './styles/App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/athlete"
            element={
              <ProtectedRoute allowedRoles={['athlete']}>
                <AthleteDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/coach"
            element={
              <ProtectedRoute allowedRoles={['coach']}>
                <CoachDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/guide"
            element={
              <ProtectedRoute allowedRoles={['athlete', 'coach', 'admin']}>
                <GuidePanel />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
