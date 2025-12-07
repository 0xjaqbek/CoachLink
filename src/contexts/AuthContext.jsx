import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '../config/firebase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setCurrentUser(user)
          setUserRole(userData.role)
        } else {
          // New user - create default profile
          // First user becomes admin, others need to be assigned a role
          const usersSnapshot = await getDoc(doc(db, 'metadata', 'userCount'))
          const isFirstUser = !usersSnapshot.exists()

          const newUserData = {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: isFirstUser ? 'admin' : null,
            createdAt: new Date().toISOString(),
            coachId: null, // For athletes, stores their coach's ID
          }

          await setDoc(doc(db, 'users', user.uid), newUserData)

          if (isFirstUser) {
            await setDoc(doc(db, 'metadata', 'userCount'), { count: 1 })
          }

          setCurrentUser(user)
          setUserRole(newUserData.role)
        }
      } else {
        setCurrentUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    currentUser,
    userRole,
    signInWithGoogle,
    signOut,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
