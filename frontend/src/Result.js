// frontend/src/Result.js

import React from 'react'

const Result = ({ wpm, accuracy }) => {
  return (
    <div className="result">
      <h2>Resultados</h2>
      <p>Palavras por minuto (WPM): {wpm}</p>
      <p>Precisão: {accuracy}%</p>
    </div>
  )
}

export default Result
