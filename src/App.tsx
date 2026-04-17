import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import CreateNotification from './pages/CreateNotification'
import AuthPage from './pages/AuthPage'
import { registerClearMailingDraftBeforeUnload } from './mailingDraftStorage'

function App() {
  useEffect(() => registerClearMailingDraftBeforeUnload(), [])

  return (
    <Routes>
      <Route path="/" element={<CreateNotification />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
