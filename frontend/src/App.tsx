import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Routes will be added as features are implemented */}
      </Routes>
    </Router>
  )
}
