import { Navigate, Route, Routes } from 'react-router-dom'
import CreateNotification from './pages/CreateNotification'
import AuthPage from './pages/AuthPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateNotification />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
