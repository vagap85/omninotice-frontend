import { Routes, Route } from 'react-router-dom'
import CreateNotification from './pages/CreateNotification'

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateNotification />} />
    </Routes>
  )
}

export default App
