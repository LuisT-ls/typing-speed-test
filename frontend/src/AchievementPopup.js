import React from 'react'

const AchievementPopup = ({ message }) => {
  return (
    <div className="achievement-popup">
      <div className="achievement-content">
        <h3>Conquista Desbloqueada!</h3>
        <p>{message}</p>
      </div>
    </div>
  )
}

export default AchievementPopup
