import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Music Manager</h1>
          <p>Manage your local audio files and streaming URLs</p>
        </header>
        <Routes>
          <Route path="/" element={<div className="app-content"><p>Welcome to Music Manager</p></div>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
