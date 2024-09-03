// frontend/src/App.js

import React from 'react'
import TypingTest from './TypingTest'
import ScoresList from './ScoresList'
import './style/App.css'

function App() {
  return (
    <div className="App">
      <TypingTest />
      <ScoresList />
    </div>
  )
}

export default App
