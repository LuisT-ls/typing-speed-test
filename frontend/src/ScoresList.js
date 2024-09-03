// frontend/src/ScoresList.js

import React, { useEffect, useState } from 'react'
import axios from 'axios'

const ScoresList = () => {
  const [scores, setScores] = useState([])

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      const response = await axios.get('/scores')
      setScores(response.data)
    } catch (error) {
      console.error('Erro ao buscar pontuações:', error)
    }
  }

  return (
    <div className="scores-list">
      <h2>Últimas Pontuações</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>WPM</th>
            <th>Precisão (%)</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {scores.map(score => (
            <tr key={score._id}>
              <td>{score.name}</td>
              <td>{score.wpm}</td>
              <td>{score.accuracy}</td>
              <td>{new Date(score.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ScoresList
