import { useState, useEffect, useRef } from 'react'
import { collection, query, where, orderBy, getDocs, addDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Messages.css'

const Messages = ({ role, coachId, athletes }) => {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Auto-select user based on role
    if (role === 'athlete' && coachId) {
      setSelectedUser(coachId)
    } else if (role === 'coach' && athletes?.length > 0) {
      setSelectedUser(athletes[0].id)
    }
  }, [role, coachId, athletes])

  useEffect(() => {
    if (!selectedUser) return

    // Load all messages for the current conversation
    const loadMessages = async () => {
      try {
        // Get messages sent by current user to selected user
        const sentQuery = query(
          collection(db, 'messages'),
          where('senderId', '==', currentUser.uid),
          where('receiverId', '==', selectedUser),
          orderBy('createdAt', 'asc')
        )

        // Get messages received by current user from selected user
        const receivedQuery = query(
          collection(db, 'messages'),
          where('senderId', '==', selectedUser),
          where('receiverId', '==', currentUser.uid),
          orderBy('createdAt', 'asc')
        )

        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery)
        ])

        const sentMessages = sentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const receivedMessages = receivedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Combine and sort by timestamp
        const allMessages = [...sentMessages, ...receivedMessages].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )

        setMessages(allMessages)
        setLoading(false)
      } catch (error) {
        console.error('Error loading messages:', error)
        setLoading(false)
      }
    }

    loadMessages()

    // Set up real-time listener
    const unsubscribeSent = onSnapshot(
      query(
        collection(db, 'messages'),
        where('senderId', '==', currentUser.uid),
        where('receiverId', '==', selectedUser),
        orderBy('createdAt', 'asc')
      ),
      () => loadMessages()
    )

    const unsubscribeReceived = onSnapshot(
      query(
        collection(db, 'messages'),
        where('senderId', '==', selectedUser),
        where('receiverId', '==', currentUser.uid),
        orderBy('createdAt', 'asc')
      ),
      () => loadMessages()
    )

    return () => {
      unsubscribeSent()
      unsubscribeReceived()
    }
  }, [selectedUser, currentUser.uid])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        receiverId: selectedUser,
        text: newMessage.trim(),
        createdAt: new Date().toISOString(),
        read: false
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Błąd podczas wysyłania wiadomości')
    }
  }

  const getSelectedUserName = () => {
    if (role === 'athlete') {
      const coach = athletes?.find(a => a.id === selectedUser)
      return coach?.displayName || 'Trener'
    } else {
      const athlete = athletes?.find(a => a.id === selectedUser)
      return athlete?.displayName || 'Zawodnik'
    }
  }

  if (role === 'athlete' && !coachId) {
    return (
      <div className="card">
        <h3>Brak przypisanego trenera</h3>
        <p>Skontaktuj się z administratorem w celu przypisania do trenera.</p>
      </div>
    )
  }

  if (role === 'coach' && (!athletes || athletes.length === 0)) {
    return (
      <div className="card">
        <h3>Brak przypisanych zawodników</h3>
        <p>Administrator może przypisać zawodników do Twojego konta.</p>
      </div>
    )
  }

  return (
    <div className="messages-container">
      {role === 'coach' && athletes && athletes.length > 0 && (
        <div className="users-sidebar">
          <h3>Zawodnicy</h3>
          <div className="users-list">
            {athletes.map(athlete => (
              <button
                key={athlete.id}
                className={`user-item ${selectedUser === athlete.id ? 'active' : ''}`}
                onClick={() => setSelectedUser(athlete.id)}
              >
                {athlete.photoURL && (
                  <img src={athlete.photoURL} alt={athlete.displayName} className="user-avatar-small" />
                )}
                <span>{athlete.displayName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-header">
          <h3>Wiadomości: {getSelectedUserName()}</h3>
        </div>

        <div className="messages-list">
          {loading ? (
            <div className="loading">Wczytuję wiadomości...</div>
          ) : messages.length === 0 ? (
            <div className="no-messages">
              <p>Brak wiadomości. Rozpocznij rozmowę!</p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {new Date(message.createdAt).toLocaleString('pl-PL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Wpisz wiadomość..."
            className="message-input"
          />
          <button type="submit" className="btn btn-primary send-btn">
            Wyślij
          </button>
        </form>
      </div>
    </div>
  )
}

export default Messages
