import React from 'react'

const VirtualKeyboard = ({ highlightedKeys }) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ]

  const isKeyHighlighted = key => {
    return highlightedKeys && highlightedKeys.toUpperCase().includes(key)
  }

  return (
    <div className="virtual-keyboard">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map(key => (
            <div
              key={key}
              className={`key ${isKeyHighlighted(key) ? 'active' : ''}`}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default VirtualKeyboard
