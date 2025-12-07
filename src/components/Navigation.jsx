import { useAuth } from '../contexts/AuthContext'
import '../styles/Navigation.css'

const Navigation = () => {
  const { currentUser, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-left">
          <h2 className="nav-title">CoachLink</h2>
        </div>
        <div className="nav-right">
          <div className="user-info">
            {currentUser?.photoURL && (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="user-avatar"
              />
            )}
            <span className="user-name">{currentUser?.displayName}</span>
          </div>
          <button onClick={handleSignOut} className="btn btn-secondary">
            Wyloguj
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
