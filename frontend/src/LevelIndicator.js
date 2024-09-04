import React from 'react'

const LevelIndicator = ({ level }) => {
  return (
    <div className="level-indicator">
      <span className="level-label">Nível:</span>
      <span className="level-value">{level}</span>
    </div>
  )
}

export default LevelIndicator
