import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <p>Wczytuję...</p>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!userRole) {
    return (
      <div className="container">
        <div className="card">
          <h2>Brak przypisanej roli</h2>
          <p>Twoje konto nie ma jeszcze przypisanej roli. Skontaktuj się z administratorem.</p>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={`/${userRole}`} replace />
  }

  return children
}

export default ProtectedRoute
